import { Nullable, Overwrite } from '@surface/types';
import { merge }         from '@surface/common';
import * as http               from 'http';
import * as path               from 'path';

export class ServerConfiguration
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

    private wwwRootValue: string;
    public get wwwroot(): string
    {
        return this.wwwRootValue
    }
    
    public set wwwroot(value: string)
    {
        this.wwwRootValue = value;
    }

    private startupValue : Nullable<ServerConfiguration.Startup>
    public get startup(): Nullable<ServerConfiguration.Startup>
    {
        return this.startupValue;
    }
    
    public set startup(value: Nullable<ServerConfiguration.Startup>)
    {
        this.startupValue = value;
    }

    private routesValue : ServerConfiguration.Routes
    public get routes(): ServerConfiguration.Routes
    {
        return this.routesValue;
    }
    
    public set routes(value: ServerConfiguration.Routes)
    {
        this.routesValue = value;
    }

    public constructor(context: string, config: Partial<ServerConfiguration.Json>)
    {
        this.port = config.port || 1337;

        this.routes = merge(config.routes, { fallback: '/home', paths: ['/{controller=home}/{action=index}/{id?}'] });

        if (typeof config.startup)
            this.startup = require(path.resolve(context, config.startup));

        this.wwwroot = config.wwwroot && path.resolve(context, config.wwwroot) || '/wwwroot';
    }
}

export namespace ServerConfiguration
{
    export type Json = Overwrite<ServerConfiguration, { startup: string }>;

    export type Routes = { fallback: string, paths: Array<string> }

    export interface Startup
    {
        onStart?(): void;
        onBeginRequest?(request: http.IncomingMessage): void;
        onEndRequest?(request: http.IncomingMessage, response: http.ServerResponse): void;
        onError?(error: Error, request: http.IncomingMessage, response: http.ServerResponse): void;
    }
}