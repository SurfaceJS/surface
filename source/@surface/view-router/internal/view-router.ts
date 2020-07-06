import { normalizeUrlPath, stringfyQuery, typeGuard, Constructor, Indexer, IDisposable } from "@surface/core";
import CustomElement                                                                     from "@surface/custom-element";
import Container                                                                         from "@surface/dependency-injection";
import IRouteData                                                                        from "@surface/router/internal/interfaces/route-data";
import Router                                                                            from "@surface/router/internal/router";
import IRouteConfig                                                                      from "./interfaces/route-config";
import RouterSlot                                                                        from "./router-slot";
import ToDirectiveHandler                                                                from "./to-directive-handler";
import { Component, Module }                                                             from "./types";

type NamedRoute =
{
    name:    string,
    params?: Indexer,
    query?:  Indexer<string>,
};

export default class ViewRouter implements IDisposable
{
    private static readonly scopeSubscriptions: Map<string, ViewRouter> = new Map();
    public static readonly ROUTE_DATA_KEY: symbol = Symbol("view-router:route-data-key");
    private readonly routerSlots: Map<string, RouterSlot> = new Map();

    private readonly history:     Array<[IRouteConfig, IRouteData]>  = [];
    private readonly namedRoutes: Map<string, IRouteConfig>          = new Map();
    private readonly router:      Router<[IRouteConfig, IRouteData]> = new Router();

    private container: Container;
    private disposed:  boolean       = false;
    private index:     number        = 0;
    private routes:    Array<IRouteConfig>;

    public constructor(routes: Array<IRouteConfig>, container: Container = new Container())
    {
        this.routes    = routes;
        this.container = container;

        for (const routeItem of routes)
        {
            if (routeItem.name)
            {
                ViewRouter.subscribeScope(routeItem.slot ?? "", this);

                this.namedRoutes.set(routeItem.name, routeItem);
            }

            this.router.map(routeItem.path, routeData => [routeItem, routeData]);
        }

        this.push(window.location.pathname + window.location.search + window.location.hash);
    }

    public static register(viewRouter: RouterSlot)
    {
        const scope = viewRouter.getAttribute("name") ?? "";

        ViewRouter.scopeSubscriptions.get(scope)?.routerSlots.set(scope, viewRouter);
    }

    public static registerDirective(router: ViewRouter): void
    {
        CustomElement.registerDirective("to", (...args) => new ToDirectiveHandler(router, ...args));
    }

    public static subscribeScope(scope: string, router: ViewRouter): void
    {
        ViewRouter.scopeSubscriptions.set(scope, router);
    }

    public static unsubscribeScope(scope: string): void
    {
        ViewRouter.scopeSubscriptions.delete(scope);
    }

    public static unregister(viewRouter: RouterSlot)
    {
        const scope = viewRouter.getAttribute("name") ?? "";

        ViewRouter.scopeSubscriptions.get(scope)?.routerSlots.delete(scope);
    }

    private async create(routeConfig: IRouteConfig, routeData: IRouteData, useHistory: boolean = false)
    {
        const constructor = await this.resolveComponent(routeConfig.component);

        this.container.register(ViewRouter.ROUTE_DATA_KEY, () => routeData);

        const element = this.container.resolveConstructor(constructor);

        const routerScope = routeConfig.slot ?? "";

        const slot = this.routerSlots.get(routerScope);

        slot?.set(element);

        if (!useHistory)
        {
            this.history.push([routeConfig, routeData]);

            this.index = this.history.length - 1;
        }

        this.resolve?.();
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

    private resolve?(): void;

    public async back(): Promise<void>
    {
        await this.go(-1);
    }

    public dispose(): void
    {
        if (!this.disposed)
        {
            for (const routeItem of this.routes)
            {
                ViewRouter.unsubscribeScope(routeItem.slot ?? "");
            }

            this.disposed = true;
        }
    }

    public async forward(): Promise<void>
    {
        await this.go(1);
    }

    public async go(value: number): Promise<void>
    {
        this.index += value;

        if (this.index < 0 || this.index > this.history.length - 0)
        {
            throw new Error("Out of range");
        }

        const [routeItem, routeData] = this.history[this.index];

        await this.create(routeItem, routeData, true);
    }

    public async push(route: string | NamedRoute): Promise<void>
    {
        if (typeof route == "string")
        {
            const match = this.router.match(route);

            if (match)
            {
                await this.create(...match);

            }
            else
            {
                this.routerSlots.forEach(x => x.clear());
            }

            window.history.pushState(null, "", route);
        }
        else
        {
            const routeItem = this.namedRoutes.get(route.name);

            if (routeItem)
            {
                const routeData: IRouteData =
                {
                    hash:   "",
                    params: route.params ?? { },
                    path:   route.name,
                    query:  route.query ?? { },
                };

                await this.create(routeItem, routeData);
            }
            else
            {
                this.routerSlots.forEach(x => x.clear());
            }

            window.history.pushState(null, "", normalizeUrlPath(route.name) + (route.query ? stringfyQuery(route.query) : ""));
        }
    }
}