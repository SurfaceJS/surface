import { Action1, LiteralObject } from '@surface/types';

export class Router
{
    private _routes: LiteralObject<Action1<Router.Path>> = { };

    public constructor()
    {        
        let self = this;
        window.onpopstate = function(this: Window, event: PopStateEvent)
        {
            self.routeTo(this.location.pathname);
        }
    }

    private parsePath(path: string): Router.Path
    {
        let [root, queryString] = path.split('?');

        let args: LiteralObject<string> = { };

        if (queryString)
        {
            decodeURIComponent(queryString)
            .split('&')
            .map
            (
                x =>
                {
                    let [key, value] = x.split('=');
                    if (key)
                    return { key, value }
                    else
                    return null;
                }
            )
            .filter(x => x != null)
            .forEach(x => args[x!.key] = x!.value);
        }

        return { root, args };
    }

    public routeTo(path: string|Location): void
    {
        if (path instanceof Location)
            path = path.pathname + path.search;

        window.history.pushState(null, "", path);
        let route = this._routes[path];

        if (route)
            route(this.parsePath(path));
        else if (this._routes['/*'])
            this._routes['/*'](this.parsePath(path));
    }

    public when(route: string, action: Action1<Router.Path>): this
    {
        this._routes[route] = action;
        return this;
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