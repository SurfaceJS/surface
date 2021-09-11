import type { Constructor }                             from "@surface/core";
import { Event, Lazy, assertGet, joinPaths, typeGuard } from "@surface/core";
import { painting }                                     from "@surface/custom-element";
import type { IScopedProvider }                         from "@surface/dependency-injection";
import Container                                        from "@surface/dependency-injection";
import { computed }                                     from "@surface/observer";
import Router                                           from "@surface/router";
import type { RouteData }                               from "@surface/router";
import type IRouteableElement                           from "./interfaces/routeable-element";
import type IRouterMiddleware                           from "./interfaces/router-interceptor";
import Metadata                                         from "./metadata.js";
import RouteConfigurator                                from "./route-configurator.js";
import type Component                                   from "./types/component";
import type Module                                      from "./types/module";
import type NamedRoute                                  from "./types/named-route";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type Route                                       from "./types/route";
import type RouteDefinition                             from "./types/route-definition";
import type WebRouterOptions                            from "./types/web-router-options";

const LEADING_SLASH_PATTERN = /^\//;

type Context =
{
    definition: RouteDefinition,
    route:      Route,
};

export default class WebRouter
{
    private readonly baseUrl:           string;
    private readonly connectedElements: IRouteableElement[] = [];
    private readonly container:         Container;
    private readonly history:           [URL, RouteDefinition, RouteData][] = [];
    private readonly interceptors:      IRouterMiddleware[];
    private readonly root:              Lazy<HTMLElement>;
    private readonly router:            Router<[RouteDefinition, RouteData]> = new Router();

    private cache: Record<string, IRouteableElement>[] = [];
    private index: number                              = 0;
    private context?: Context;
    private scope: IScopedProvider;

    public readonly routeChangeEvent: Event<{ to: Route, from?: Route }> = new Event();

    @computed("current")
    public get route(): Route
    {
        return this.context?.route
        ?? {
            meta:       { },
            name:       "",
            parameters: { },
            url:        new URL(window.location.href),
        };
    }

    public constructor(options: WebRouterOptions)
    {
        this.root = new Lazy(() => assertGet(document.querySelector<HTMLElement>(options.root), `Cannot find root element using selector: ${options.root}`));

        this.baseUrl      = options.baseUrl       ?? /* c8 ignore next */ "";
        this.container    = options.container     ?? /* c8 ignore next */ new Container();
        this.interceptors = (options.interceptors ?? /* c8 ignore next */ []).map(x => typeof x == "function" ? this.container.inject(x) : x);
        this.scope        = this.container.createScope();

        /* c8 ignore next */ // c8 can't cover iterable
        for (const definition of RouteConfigurator.configure(options.routes))
        {
            this.router.map
            ({
                constraints:  definition.constraints,
                name:         definition.name,
                pattern:      joinPaths(this.baseUrl, definition.path),
                selector:     routeData => [definition, routeData],
                transformers: definition.transformers,
            });
        }

        this.container.registerSingleton(WebRouter, this);

        window.addEventListener("popstate", () => void this.pushCurrentLocation());
    }

    private connectToOutlet(parent: HTMLElement, element: IRouteableElement, key: string, to: Route, from?: Route, outletSelector = "router-outlet", reconnect = false): void
    {
        const outlets = Metadata.from(parent).outlets;

        let outlet = outlets.get(key) ?? null;

        if (!outlet || !outlet.isConnected)
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
            const router = this;

            outlet.remove = function(this: HTMLElement)
            {
                this.parentNode?.removeChild(this);

                if (router.route == to)
                {
                    void painting().then(() => router.connectToOutlet(parent, element, key, to, from, outletSelector, true));
                }
            }.bind(outlet);

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

            if (!reconnect)
            {
                element.onRouteEnter?.(to, from);
            }

            this.connectedElements.push(element);
        }
        else
        {
            throw new Error(`Cannot find outlet by provided selector "${outletSelector}${key == "default" ? "" : `[name=${key}]`}"`);
        }
    }

    private async create(url: URL, definition: RouteDefinition, routeData: RouteData, fromHistory: boolean, replace: boolean): Promise<void>
    {
        const to   = this.createRoute(url, definition, routeData);
        const from = this.context?.route;

        if (!await this.invokeMiddleware(to, from))
        {
            const previous  = this.context;
            const hasUpdate = definition == previous?.definition;
            const cache     = this.cache.slice(0, definition.stack.length);

            this.context = { definition, route: to };

            let parent          = this.root.value as IRouteableElement;
            let requireNewScope = true;

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

                    requireNewScope = false;

                    parent = next!;
                }
                else
                {
                    if (requireNewScope)
                    {
                        this.scope.dispose();

                        this.scope = this.container.createScope();
                    }

                    let next: HTMLElement | undefined;

                    cache[index] = { };

                    for (const [key, component] of entry)
                    {
                        const constructor = await this.resolveComponent(component);

                        const element = this.scope.inject(constructor) as IRouteableElement;

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
                if (replace)
                {
                    this.history[this.index] = [url, definition, routeData];
                }
                else
                {
                    this.history.splice(this.index + 1, Infinity);

                    this.history.push([url, definition, routeData]);

                    this.index = this.history.length - 1;
                }
            }

            this.routeChangeEvent.notify({ from, to });
        }
    }

    private createRoute(url: URL, definition: RouteDefinition, routeData: RouteData): Route
    {
        return {
            meta:       definition.meta,
            name:       definition.name ?? "",
            parameters: routeData.parameters,
            url,
        };
    }

    private disconnectElements(): void
    {
        this.connectedElements.forEach(x => (x.dispose?.(), x.remove()));

        this.context = undefined;
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

    private async invokeMiddleware(to: Route, from?: Route): Promise<boolean>
    {
        let intercepted = false;

        const next = async (location: string | NamedRoute): Promise<void> =>
        {
            await this.push(location);

            intercepted = true;
        };

        for (const interceptor of this.interceptors)
        {
            await interceptor.intercept(next, to, from);

            if (intercepted)
            {
                break;
            }
        }

        return intercepted;
    }

    private resolvePath(path: string): URL
    {
        return new URL(path.replace(LEADING_SLASH_PATTERN, ""), `${joinPaths(window.location.origin, this.baseUrl)}/`);
    }

    private async pushOrReplace(route: string | NamedRoute, replace: boolean): Promise<void>
    {
        if (typeof route == "string")
        {
            const url = this.resolvePath(route);

            const match = this.router.match(url.pathname);

            if (match.matched)
            {
                await this.create(url, ...match.value, false, replace);

                window.history.pushState(null, "", this.route.url.href);
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

                await this.create(url, routeConfig, routeData, false, replace);

                window.history.pushState(null, "", this.route.url.href);
            }
            else
            {
                this.disconnectElements();
            }
        }
    }

    public async back(): Promise<void>
    {
        await this.go(-1);
    }

    public async forward(): Promise<void>
    {
        await this.go(1);
    }

    public async go(delta: number): Promise<void>
    {
        const index = Math.min(Math.max(this.index + delta, 0), this.history.length - 1);

        if (index != this.index)
        {
            const [url, routeItem, routeData] = this.history[index];

            await this.create(url, routeItem, routeData, true, false);

            window.history.replaceState(null, "", url.href);

            this.index = index;
        }
    }

    public async push(route: string | NamedRoute): Promise<void>
    {
        return this.pushOrReplace(route, false);
    }

    public async replace(route: string | NamedRoute): Promise<void>
    {
        return this.pushOrReplace(route, true);
    }

    public async pushCurrentLocation(): Promise<void>
    {
        await this.push(window.location.href);
    }
}