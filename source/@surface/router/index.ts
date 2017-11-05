import '@surface/enumerable/extensions';
import { Route }   from '@surface/router/route';
import { Action1 } from '@surface/types';

export enum RoutingType
{
    Abstract,
    Hash,
    History
}

export abstract class Router
{
    public static create(routingType: RoutingType, routes: Array<string>): Router
    {        
        let route = new Route(routes);
        switch (routingType)
        {
            case RoutingType.Abstract:
                throw new Error('Not implemented');
            case RoutingType.Hash:
                throw new Error('Not implemented');
            case RoutingType.History:
                return new HistoryHandler(route);
        }
    }

    public abstract routeTo(path: string): void;
    public abstract when(route: string, action: Action1<Route>): Router;
}

class HistoryHandler implements Router
{
    private route: Route

    public constructor(route: Route)
    {
        this.route = route;
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

    public when(route: string, action: Action1<Router.Path>): HistoryHandler
    {
        //this.routes[route] = action;
        return this;
    }
}