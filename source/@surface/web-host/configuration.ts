import { merge } from '@surface/common';
import * as path from 'path';

export class Configuration
{    
    private _port : number;
    public get port() : number
    {
        return this._port;
    }
    
    public set port(value : number)
    {
        this._port = value;
    }

    private _routes : Configuration.Routes
    public get routes(): Configuration.Routes
    {
        return this._routes;
    }
    
    public set routes(value: Configuration.Routes)
    {
        this._routes = value;
    }

    private _wwwRoot: string;
    public get wwwroot(): string
    {
        return this._wwwRoot
    }
    
    public set wwwroot(value: string)
    {
        this._wwwRoot = value;
    }

    public constructor(context: string, config: Partial<Configuration>)
    {
        this.port    = config.port || 1337;
        this.routes  = merge(config.routes, { fallback: '/home', paths: ['/{controller=home}/{action=index}/{id?}'] });
        this.wwwroot = config.wwwroot && path.resolve(context, config.wwwroot) || '/wwwroot';
    }
}

export namespace Configuration
{
    export type Routes = { fallback: string, paths: Array<string> }
}