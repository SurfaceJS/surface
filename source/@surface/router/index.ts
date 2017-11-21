import '@surface/collection/extensions';
import { Route }             from './route';
import { List }              from '@surface/collection/list';
import { Action1, Nullable } from '@surface/types';

export enum RoutingType
{
    Abstract,
    Hash,
    History
}

export abstract class Router
{
    protected _routes: List<Route>;

    public constructor(routes: Array<Route>);
    public constructor(routes: List<Route>);
    public constructor(routes: Array<Route>|List<Route>)
    {
        if (Array.isArray(routes))
            routes = new List(routes);

        this._routes = routes;
    }

    public static create(routingType: RoutingType, routes: Array<string>): Router
    {        
        let route = routes.asEnumerable().select(x => new Route(x)).toList();

        switch (routingType)
        {
            case RoutingType.Abstract:
                return new AbstractRouter(route);
            case RoutingType.Hash:
                return new HashRouter(route);
            case RoutingType.History:
                return new HistoryRouter(route);
        }
    }

    public match(path: string): Nullable<Route.Data>
    {
        return this._routes.select(x => x.match(path)).firstOrDefault(x => !!x);
    }

    public abstract routeTo(path: string): void;
    public abstract when(route: string, action: Action1<Route.Data>): Router;
}

class AbstractRouter extends Router
{
    public constructor(routes: List<Route>)
    {
        super(routes);
    }

    public routeTo(path: string): void
    {
        throw new Error("Method not implemented.");
    }

    public when(route: string, action: Action1<Route.Data>): Router
    {
        throw new Error("Method not implemented.");
    }
}

class HashRouter extends Router
{
    public constructor(routes: List<Route>)
    {
        super(routes);
    }
    
    public routeTo(path: string): void
    {
        throw new Error("Method not implemented.");
    }
    public when(route: string, action: Action1<Route.Data>): Router {
        throw new Error("Method not implemented.");
    }    
}

class HistoryRouter extends Router
{
    
    public constructor(routes: List<Route>)
    {
        super(routes);

        let self = this;
        window.onpopstate = function(this: Window, event: PopStateEvent)
        {
            self.routeTo(this.location.pathname);
        }
    }
    
    public routeTo(path: string): void
    {
        /*
        window.history.pushState(null, "", path);
        let route = this.routes[path];

        if (route)
            route(this.parsePath(path));
        else if (this.routes['/*'])
            this.routes['/*'](this.parsePath(path));
        */
    }

    public when(route: string, action: Action1<Route.Data>): HistoryRouter
    {
        //this.routes[route] = action;
        return this;
    }
}