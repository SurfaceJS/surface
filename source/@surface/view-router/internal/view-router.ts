import { Stack }                                            from "@surface/collection";
import { assertGet, typeGuard, Constructor, Indexer, Lazy } from "@surface/core";
import CustomElement                                        from "@surface/custom-element";
import Container                                            from "@surface/dependency-injection";
import { RouteData }                                        from "@surface/router";
import Router                                               from "@surface/router/internal/router";
import Metadata                                             from "./metadata";
import NavigationDirectiveHandler                           from "./navigation-directive-handler";
import RouteConfigurator                                    from "./route-configurator";
import RouterSlot                                           from "./router-slot";
import Component                                            from "./types/component";
import Module                                               from "./types/module";
import RouteConfiguration                                   from "./types/route-configuration";
import RouteDefinition                                      from "./types/route-definition";

type NamedRoute =
{
    name:        string,
    hash?:       string,
    parameters?: Indexer,
    query?:      Indexer<string>,
};

export default class ViewRouter
{
    public static readonly ROUTE_DATA_KEY: symbol = Symbol("view-router:route-data-key");

    private readonly baseUrl:        string;
    private readonly baseUrlPattern: RegExp;
    private readonly cache:          Array<Record<string, HTMLElement>>   = [];
    private readonly container:      Container;
    private readonly history:        Array<[RouteDefinition, RouteData]> = [];
    private readonly root:           Lazy<HTMLElement>;
    private readonly router:         Router<[RouteDefinition, RouteData]> = new Router();
    private readonly slotStack:      Stack<RouterSlot>                    = new Stack();
    private readonly slotTag:        string;

    private index:    number  = 0;
    private current?: { definition: RouteDefinition, routeData: RouteData };

    public constructor(root: HTMLElement | string | (() => HTMLElement), routes: Array<RouteConfiguration>, container: Container = new Container(), options: { baseUrl?: string, slotTag?: string } = { })
    {
        this.root = typeof root == "string"
            ? new Lazy(() => assertGet(document.querySelector<HTMLElement>(root), `Cannot find root element using selector: ${root}`))
            : typeof root == "object"
                ? new Lazy(() => root)
                : new Lazy(root);

        this.container      = container;
        this.baseUrl        = options.baseUrl ? (options.baseUrl.startsWith("/") ? "" : "/") + options.baseUrl.replace(/\/$/, "") : "";
        this.slotTag        = options.slotTag ?? "router-slot";
        this.baseUrlPattern = new RegExp(`^${this.baseUrl.replace(/\//g, "\\/")}`);

        for (const definition of RouteConfigurator.configure(routes))
        {
            if (definition.name)
            {
                this.router.map(definition.name, definition.path, routeData => [definition, routeData]);
            }
            else
            {
                this.router.map(definition.path, routeData => [definition, routeData]);
            }
        }
    }

    public static registerDirective(router: ViewRouter): void
    {
        CustomElement.registerDirective("to", (...args) => new NavigationDirectiveHandler(router, ...args));
    }

    private async create(definition: RouteDefinition, routeData: RouteData, useHistory: boolean = false)
    {
        if (definition == this.current?.definition)
        {
            Object.assign(this.current.routeData, routeData);
        }

        let parent = this.root.value;

        for (let index = 0; index < definition.stack.length; index++)
        {
            const entry    = definition.stack[index];
            const metadata = Metadata.from(parent);

            if (!parent.shadowRoot)
            {
                throw new Error("Route component requires an open shadowRoot");
            }

            const keys = entry.keys();

            metadata.disposeSlots(new Set(keys));

            if (entry == this.current?.definition?.stack[index])
            {
                parent = this.cache[index]["default"] ?? this.cache[index][keys.next().value];
            }
            else
            {
                let nextParent: HTMLElement | undefined;

                for (const [key, component] of entry)
                {
                    const constructor = await this.resolveComponent(component);

                    const element = Container.merge(this.container, new Container().registerSingleton(ViewRouter.ROUTE_DATA_KEY, routeData))
                        .inject(constructor);

                    (this.cache[index] = this.cache[index] ?? [])[key] = element;

                    const slot = metadata.getSlot(this.slotTag, key);

                    if (slot)
                    {
                        window.customElements.upgrade(slot);

                        slot.set(element);

                        this.slotStack.push(slot);
                    }

                    if (!nextParent || key == "default")
                    {
                        nextParent = element;
                    }
                }

                parent = nextParent!;
            }
        }

        if (!useHistory)
        {
            this.history.push([definition, routeData]);

            this.index = this.history.length - 1;
        }

        this.current = { definition, routeData };
    }

    private resolveModule(module: Constructor<HTMLElement> | Module<Constructor<HTMLElement>>): Constructor<HTMLElement>
    {
        return "default" in module ? module.default : module;
    }

    private async resolveComponent(component: Component | (() => Component)): Promise<Constructor<HTMLElement>>
    {
        if (typeof component == "function")
        {
            if (typeGuard<() => Component>(component, !component.prototype))
            {
                return await this.resolveComponent(component());
            }
            else
            {
                return this.resolveModule(component);
            }
        }
        else if (component instanceof Promise)
        {
            return this.resolveModule(await component);
        }

        return this.resolveModule(component);
    }

    public async back(): Promise<void>
    {
        await this.go(-1);
    }

    public async forward(): Promise<void>
    {
        await this.go(1);
    }

    public async go(value: number): Promise<void>
    {
        const index = Math.min(Math.max(this.index + value, 0), this.history.length - 1);

        if (index != this.index)
        {
            const [routeItem, routeData] = this.history[index];

            await this.create(routeItem, routeData, true);

            this.index = index;
        }
    }

    public async push(route: string | NamedRoute): Promise<void>
    {
        if (typeof route == "string")
        {
            const match = this.router.match(route);

            if (match.matched)
            {
                await this.create(...match.value);

                window.history.pushState(null, "", this.baseUrl + route);
            }
            else
            {
                this.slotStack.forEach(x => x.clear());

                this.current = undefined;
            }
        }
        else
        {
            const match = this.router.match(route.name, route.parameters ?? { });

            if (match.matched)
            {
                const [routeConfig, _routeData] = match.value;

                const routeData = new RouteData(_routeData.path, _routeData.parameters, route.query, route.hash);

                await this.create(routeConfig, routeData);

                window.history.pushState(null, "", this.baseUrl + routeData.toString());
            }
            else
            {
                this.slotStack.forEach(x => x.clear());

                this.current = undefined;
            }
        }
    }

    public async pushCurrentLocation(): Promise<void>
    {
        const path = this.baseUrl ? window.location.pathname.replace(this.baseUrlPattern, "") : window.location.pathname;

        await this.push(path + window.location.search + window.location.hash);
    }
}