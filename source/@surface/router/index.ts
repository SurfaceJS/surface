import { Action1 } from '@surface/types';

export class Router
{
    private _window: Window;

    public constructor(options: Router.Options)
    {
        this._window = options.window;
        
        this._window.onpopstate = function(this: Window, event: PopStateEvent)
        {
            options.onRoute(this.location.pathname);
        }
    }

    public routeTo(path: string): void
    {        
        this._window.history.pushState(null, "", path);
    }
}

export namespace Router
{
    export interface Options
    {
        window:  Window;
        onRoute: Action1<string>;
    }
}