import * as path from 'path';

export class Configuration
{
    private _context: string
    public get context(): string
    {
        return this._context;
    }

    private _port : number;
    public get port() : number
    {
        return this._port;
    }

    private _routes : Array<Configuration.Route>
    public get routes(): Array<Configuration.Route>
    {
        return this._routes;
    }

    private _wwwroot: string;
    public get wwwroot(): string
    {
        return this._wwwroot
    }

    public constructor(context: string, config: Partial<Configuration>)
    {
        this._context = context;
        this._port    = config.port || 1337;
        this._routes  = config.routes || [{ path: '/{controller=home}/{action=index}/{id?}', default: true }];
        this._wwwroot = config.wwwroot && path.resolve(context, config.wwwroot) || path.resolve(context, './wwwroot');
    }
}

export namespace Configuration
{
    export interface Route
    {
        default?:  boolean;
        fallback?: string;
        path:      string;
    }
}