import '@surface/collection/extensions';
import { Route }             from './route';
import { List }              from '@surface/collection/list';
import { Enumerable }        from '@surface/enumerable/index';
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
    
    public constructor(routes: List<Route>)
    {
        this._routes = routes;
    }

    public static create(routingType: RoutingType): Router;
    public static create(routingType: RoutingType, routes: List<Route>): Router;
    public static create(routingType: RoutingType, routes?: List<Route>): Router
    {
        routes = routes || new List();
        switch (routingType)
        {
            case RoutingType.Abstract:
                return new AbstractRouter(routes);
            case RoutingType.Hash:
                return new HashRouter(routes);
            case RoutingType.History:
                return new HistoryRouter(routes);
        }
    }

    public mapRoute(name: string, pattern: string, isDefault?: boolean): Router
    {
        this._routes.add(new Route(name, pattern, !!isDefault));
        return this;
    }

    public match(path: string): Nullable<Route.Data>
    {
        let routes = this._routes as Enumerable<Route>;

        if (path == '/')
            routes = routes.where(x => x.isDefault);

        return this._routes.select(x => x.match(path)).firstOrDefault(x => !!x);
    }

    public abstract routeTo(path: string): void;
    public abstract when(route: string, action: Action1<Nullable<Route.Data>>): Router;
}

class AbstractRouter extends Router
{
    public routeTo(path: string): void
    {
        throw new Error("Method not implemented.");
    }

    public when(route: string, action: Action1<Nullable<Route.Data>>): AbstractRouter
    {
        throw new Error("Method not implemented.");
    }
}

class HashRouter extends Router
{    
    public routeTo(path: string): void
    {
        throw new Error("Method not implemented.");
    }
    
    public when(route: string, action: Action1<Nullable<Route.Data>>): HashRouter
    {
        throw new Error("Method not implemented.");
    }    
}

class HistoryRouter extends Router
{
    private _routeAction: Action1<Nullable<Route.Data>>;

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
        window.history.pushState(null, '', path);
        
        let action = this._routeAction[path];

        if (action)
            action(this.match(path));
        else if (this._routeAction['*'])
            this._routeAction['*'](this.match(path));
    }

    public when(route: string, action: Action1<Nullable<Route.Data>>): HistoryRouter
    {
        this._routeAction[route] = action;
        return this;
    }
}