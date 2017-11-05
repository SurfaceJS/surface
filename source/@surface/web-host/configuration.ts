import { merge } from '@surface/common';
import * as path from 'path';

export class Configuration
{    
    private portValue : number;
    public get port() : number
    {
        return this.portValue;
    }
    
    public set port(value : number)
    {
        this.portValue = value;
    }

    private routesValue : Configuration.Routes
    public get routes(): Configuration.Routes
    {
        return this.routesValue;
    }
    
    public set routes(value: Configuration.Routes)
    {
        this.routesValue = value;
    }

    private wwwRootValue: string;
    public get wwwroot(): string
    {
        return this.wwwRootValue
    }
    
    public set wwwroot(value: string)
    {
        this.wwwRootValue = value;
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