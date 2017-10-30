import '@surface/enumerable/extensions';

import { Action1, LiteralObject } from '@surface/types';

export enum RoutingType
{
    Abstract,
    Hash,
    History
}

interface RountingHandler
{
    when(route: string, action: Action1<Router.Path>): RountingHandler;
    routeTo(path: string|Location): void;
}

export class Router implements RountingHandler
{   
    private handler: RountingHandler;

    public constructor(routingType: RoutingType);
    public  constructor(routingType?: RoutingType)
    {
        switch (routingType)
        {
            case RoutingType.Abstract:
                throw new Error('Not implemented');
            case RoutingType.Hash:
                throw new Error('Not implemented');
            case RoutingType.History:                
                this.handler = new HistoryHandler();
        }
    }

    public when(route: string, action: Action1<Router.Path>): RountingHandler
    {
        return this.handler.when(route, action);
    }

    public routeTo(path: string | Location): void
    {
        this.handler.routeTo(path);
    }
}

class HistoryHandler implements RountingHandler
{
    private routes: LiteralObject<Action1<Router.Path>> = { };

    public constructor()
    {
        let self = this;
        window.onpopstate = function(this: Window, event: PopStateEvent)
        {
            self.routeTo(this.location.pathname);
        }
    }

    public routeTo(path: string|Location): void
    {
        if (path instanceof Location)
            path = path.pathname + path.search;

        window.history.pushState(null, "", path);
        let route = this.routes[path];

        if (route)
            route(this.parsePath(path));
        else if (this.routes['/*'])
            this.routes['/*'](this.parsePath(path));
    }

    public when(route: string, action: Action1<Router.Path>): RountingHandler
    {
        this.routes[route] = action;
        return this;
    }

    private parsePath(path: string): Router.Path
    {
        let [root, queryString] = path.split('?');

        let args: LiteralObject<string> = { };

        if (queryString)
        {
            decodeURIComponent(queryString)
                .split('&')
                .asEnumerable()
                .select
                (
                    property =>
                    {
                        let [key, value] = property.split('=');
                        if (key)
                            return { key, value }
                        else
                            return null;
                    }
                )
                .where(x => x != null)
                .forEach(x => args[x!.key] = x!.value);
        }

        return { root, args };
    }
}

export namespace Router
{
    export interface Path
    {
        root: string;
        args: LiteralObject<string>;
    }
}