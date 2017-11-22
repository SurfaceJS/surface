export class Configuration
{
    private _serverRoot: string
    public get serverRoot(): string
    {
        return this._serverRoot;
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

    public constructor(serverRoot: string, config: Partial<Configuration>)
    {
        this._serverRoot = serverRoot;
        this._port       = config.port    || 1337;
        this._routes     = config.routes  || [{ path: '/{controller=home}/{action=index}/{id?}', default: true }];
        this._wwwroot    = config.wwwroot || 'wwwroot';
    }
}

export namespace Configuration
{
    export interface Route
    {
        path:      string;
        default?:  boolean;
        fallback?: string;
    }
}