import { Stack }                                 from "@surface/collection";
import type { Constructor }                      from "@surface/core";
import { Lazy, assertGet, joinPaths, typeGuard } from "@surface/core";
import type { DirectiveHandlerRegistry }         from "@surface/custom-element";
import Container                                 from "@surface/dependency-injection";
import Router                                    from "@surface/router";
import type { RouteData }                        from "@surface/router";
import type IMiddleware                          from "./interfaces/middleware";
import type IRouteableElement                    from "./interfaces/routeable-element";
import Metadata                                  from "./metadata.js";
import NavigationDirectiveHandler                from "./navigation-directive-handler.js";
import RouteConfigurator                         from "./route-configurator.js";
import type Component                            from "./types/component";
import type Module                               from "./types/module";
import type NamedRoute                           from "./types/named-route";
import type Route                                from "./types/route";
import type RouteConfiguration                   from "./types/route-configuration";
import type RouteDefinition                      from "./types/route-definition";
import type ViewRouterOptions                    from "./types/view-router-options";

const LEADING_SLASH_PATTERN = /^\//;

export default class WebRouter
{
    private readonly baseUrl:           string;
    private readonly connectedElements: Stack<IRouteableElement> = new Stack();
    private readonly container:         Container;
    private readonly history:           [URL, RouteDefinition, RouteData][] = [];
    private readonly middlewares:       IMiddleware[];
    private readonly root:              Lazy<HTMLElement>;
    private readonly router:            Router<[RouteDefinition, RouteData]> = new Router();

    private cache:    Record<string, IRouteableElement>[] = [];
    private index:    number  = 0;
    private current?: { definition: RouteDefinition, route: Route };

    public get route(): Route
    {
        if (this.current)
        {
            return this.current.route;
        }

        throw new Error("Router stack is empty");
    }

    public constructor(root: string, routes: RouteConfiguration[], options: ViewRouterOptions = { })
    {
        this.root = new Lazy(() => assertGet(document.querySelector<HTMLElement>(root), `Cannot find root element using selector: ${root}`));

        this.baseUrl     = options.baseUrl      ?? /* c8 ignore next */ "";
        this.container   = options.container    ?? /* c8 ignore next */ new Container();
        this.middlewares = (options.middlewares ?? /* c8 ignore next */ []).map(x => typeof x == "function" ? this.container.inject(x) : x);

        /* c8 ignore next */ // c8 can't cover iterable
        for (const definition of RouteConfigurator.configure(routes))
        {
            if (definition.name)
            {
                this.router.map(definition.name, joinPaths(this.baseUrl, definition.path), routeData => [definition, routeData]);
            }
            else
            {
                this.router.map(joinPaths(this.baseUrl, definition.path), routeData => [definition, routeData]);
            }
        }

        this.container.registerSingleton(WebRouter, this as WebRouter);
    }

    public static createDirectiveRegistry(router: WebRouter): DirectiveHandlerRegistry
    {
        return { handler: (...args) => new NavigationDirectiveHandler(router, ...args), name: "to" };
    }

    private connectToOutlet(parent: HTMLElement, element: IRouteableElement, key: string, to: Route, from?: Route, outletSelector = "router-outlet"): void
    {
        const outlets = Metadata.from(parent).outlets;

        let outlet = outlets.get(key) ?? null;

        if (!outlet)
        {
            if (!parent.shadowRoot)
            {
                throw new Error("Routeable component requires an open shadowRoot");
            }

            outlet = parent.shadowRoot.querySelector<HTMLElement>(key == "default" ? `${outletSelector}:not([name])` : `${outletSelector}[name=${key}]`);
        }

        // istanbul ignore else
        if (outlet)
        {
            outlets.set(key, outlet);

            const oldElement = outlet.firstElementChild as IRouteableElement | null;

            if (oldElement)
            {
                oldElement.onRouteLeave?.(to, from);

                oldElement.dispose?.();

                outlet.replaceChild(element, oldElement);
            }
            else
            {
                outlet.appendChild(element);
            }

            element.onRouteEnter?.(to, from);

            this.connectedElements.push(element);
        }
        else
        {
            throw new Error(`Cannot find outlet by provided selector "${outletSelector}${key == "default" ? "" : `[name=${key}]`}"`);
        }
    }

    private async create(url: URL, definition: RouteDefinition, routeData: RouteData, fromHistory: boolean = false): Promise<void>
    {
        const to   = this.createRoute(url, definition, routeData);
        const from = this.current?.route;

        if (!this.invokeMiddleware(to, from))
        {
            const previous  = this.current;
            const hasUpdate = definition == previous?.definition;
            const cache     = this.cache.slice(0, definition.stack.length);

            this.current = { definition, route: to };

            let parent = this.root.value as IRouteableElement;

            for (let index = 0; index < definition.stack.length; index++)
            {
                const entry = definition.stack[index];

                const keys = new Set(entry.keys());

                this.disconnectFromOutlets(parent, keys, to, from);

                if (entry == previous?.definition?.stack[index])
                {
                    const next = cache[index].default ?? cache[index][keys.values().next().value];

                    if (hasUpdate)
                    {
                        next.onRouteUpdate?.(to, from);
                    }
                    else
                    {
                        next.onRouteEnter?.(to, from);
                    }

                    parent = next!;
                }
                else
                {
                    let next: HTMLElement | undefined;

                    cache[index] = { };

                    for (const [key, component] of entry)
                    {
                        const constructor = await this.resolveComponent(component);

                        const element = this.container.inject(constructor) as IRouteableElement;

                        this.connectToOutlet(parent, element, key, to, from, definition.selector);

                        cache[index][key] = element;

                        if (!next || key == "default")
                        {
                            next = element;
                        }
                    }

                    parent = next!;
                }
            }

            this.cache = cache;

            if (!fromHistory)
            {
                this.history.push([url, definition, routeData]);

                this.index = this.history.length - 1;
            }
        }
    }

    private createRoute(url: URL, definition: RouteDefinition, routeData: RouteData): Route
    {
        return {
            meta:       definition.meta,
            name:       definition.name,
            parameters: routeData.parameters,
            url,
        };
    }

    private disconnectElements(): void
    {
        this.connectedElements.forEach(x => (x.dispose?.(), x.remove()));

        this.current = undefined;
    }

    private disconnectFromOutlets(parent: HTMLElement, exclude: Set<string>, to: Route, from?: Route): void
    {
        const outlets = Metadata.from(parent).outlets;

        for (const outlet of outlets.values())
        {
            if (!exclude.has(outlet.getAttribute("name") ?? "default"))
            {
                const instance = outlet.firstElementChild;

                if (typeGuard<IRouteableElement>(instance, !!instance))
                {
                    instance.onRouteLeave?.(to, from);

                    instance.dispose?.();

                    instance.remove();
                }
            }
        }
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
                return this.resolveComponent(component());
            }
        }
        else if (component instanceof Promise)
        {
            return this.resolveModule(await component);
        }

        return this.resolveModule(component);
    }

    private invokeMiddleware(to: Route, from?: Route): boolean
    {
        let handled = false;

        const next = (location: string | NamedRoute): boolean =>
            (this.push(location), handled = true);

        for (const middleware of this.middlewares)
        {
            middleware.execute(to, from, next);

            if (handled)
            {
                break;
            }
        }

        return handled;
    }

    private resolvePath(path: string): URL
    {
        return new URL(path.replace(LEADING_SLASH_PATTERN, ""), `${joinPaths(window.location.origin, this.baseUrl)}/`);
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
            const [url, routeItem, routeData] = this.history[index];

            await this.create(url, routeItem, routeData, true);

            this.index = index;
        }
    }

    public async push(route: string | NamedRoute): Promise<void>
    {
        if (typeof route == "string")
        {
            const url = this.resolvePath(route);

            const match = this.router.match(url.pathname);

            if (match.matched)
            {
                await this.create(url, ...match.value);

                window.history.pushState(null, "", url.href);
            }
            else
            {
                this.disconnectElements();
            }
        }
        else
        {
            const match = this.router.match(route.name, route.parameters ?? { });

            if (match.matched)
            {
                const [routeConfig, routeData] = match.value;

                const url = new URL(joinPaths(window.location.origin, routeData.path));

                url.hash = route.hash ?? "";

                for (const [key, value] of Object.entries(route.query ?? { }) as [string, string | string[]][])
                {
                    if (Array.isArray(value))
                    {
                        value.forEach(x => url.searchParams.append(key, x));
                    }
                    else
                    {
                        url.searchParams.set(key, value);
                    }
                }

                await this.create(url, routeConfig, routeData);

                window.history.pushState(null, "", url.href);
            }
            else
            {
                this.disconnectElements();
            }
        }
    }

    public async pushCurrentLocation(): Promise<void>
    {
        await this.push(window.location.href);
    }
}