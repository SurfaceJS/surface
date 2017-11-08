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
        
        let x = route.match('/');
        let y = route.match('/about/');
        let z = route.match('/controller/foo/action/1');
        console.log({ x, y, z });

        switch (routingType)
        {
            case RoutingType.Abstract:
                throw new AbstractRouter(route);
            case RoutingType.Hash:
                throw new HashRouter(route);
            case RoutingType.History:
                return new HistoryRouter(route);
        }
    }

    public abstract match(path: string): Route;
    public abstract routeTo(path: string): void;
    public abstract when(route: string, action: Action1<Route>): Router;
}

class AbstractRouter extends Router
{
    
    private route: Route;

    public constructor(route: Route)
    {
        super();
        this.route = route;
    }

    public match(path: string): Route
    {
        let foo = this.route.match(path);

        console.log(foo);
        return {} as Route;
    }

    public routeTo(path: string): void
    {
        throw new Error("Method not implemented.");
    }

    public when(route: string, action: Action1<Route>): Router
    {
        throw new Error("Method not implemented.");
    }
}

class HashRouter extends Router
{
    private route: Route;

    public constructor(route: Route)
    {
        super();
        this.route = route;
    }

    public match(path: string): Route
    {
        throw new Error("Method not implemented.");
    }
    
    public routeTo(path: string): void
    {
        throw new Error("Method not implemented.");
    }
    public when(route: string, action: Action1<Route>): Router {
        throw new Error("Method not implemented.");
    }    
}

class HistoryRouter extends Router
{
    private route: Route;

    public constructor(route: Route)
    {
        super();
        this.route = route;
        let self   = this;
        window.onpopstate = function(this: Window, event: PopStateEvent)
        {
            self.routeTo(this.location.pathname);
        }
    }

    public match(path: string): Route
    {
        throw new Error("Method not implemented.");
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

    public when(route: string, action: Action1<Route>): HistoryRouter
    {
        //this.routes[route] = action;
        return this;
    }
}