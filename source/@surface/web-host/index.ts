import '@surface/reflection/extensions';

import { Configuration }       from './configuration';
import { Handler }             from './handler';
import { HttpContext }         from './http-context';
import { StaticHandler }       from './static-handler';
import { MvcHandler }          from './mvc-handler';
import { List }                from '@surface/collection/list';
import { Router, RoutingType } from '@surface/router';
import * as http               from 'http';

export class WebHost
{
    private _startup: WebHost.Startup;
    private _handlers: List<Handler>;

    private static _instance: WebHost
    public static get instance(): WebHost
    {
        return this._instance;
    }

    private _port: number
    public get port(): number
    {
        return this._port;
    }

    private _root: string
    public get root(): string
    {
        return this._root;
    }

    private _routes: Array<Configuration.Route>
    public get routes(): Array<Configuration.Route>
    {
        return this._routes;
    }

    private _router: Router
    public get router(): Router
    {
        return this._router;
    }

    private _wwwroot: string
    public get wwwroot(): string
    {
        return this._wwwroot;
    }

    private constructor(configuration: Configuration)
    {
        this._root    = configuration.serverRoot;
        this._routes  = configuration.routes;
        this._port    = configuration.port;
        this._wwwroot = configuration.wwwroot;

        this._handlers = new List();

        this._router = Router.create(RoutingType.Abstract, this._routes.asEnumerable().select(x => x.path).toArray());
    }

    public run(): void
    {
        if (this._startup && this._startup.onStart)
            this._startup.onStart();

        http.createServer(this.listener.bind(this)).listen(this._port);
    }

    public useFallBack(): WebHost
    {
        return this;
    }

    public useStatic(): WebHost
    {
        this._handlers.add(new StaticHandler());
        return this;
    }    

    public useMvc(): WebHost
    {
        this._handlers.add(new MvcHandler());
        return this;
    }

    public useStartup<T extends WebHost.Startup>(startup: T): WebHost
    {
        this._startup = startup;
        return this;
    }

    public static create(config: Configuration): WebHost
    {
        WebHost._instance = new WebHost(config);
        return WebHost._instance;
    }

    private async listener(request: http.IncomingMessage, response: http.ServerResponse): Promise<void>
    {
        const httpContext = new HttpContext(this, request, response);

        try
        {
            if (this._startup && this._startup.onBeginRequest)
                this._startup.onBeginRequest(httpContext);

            if (this._handlers.all(x => !x.handle(httpContext)))
                throw new Error('No one request handler has accepted the request.');
            
            if (this._startup && this._startup.onEndRequest)
                this._startup.onEndRequest(httpContext);
        }
        catch (error)
        {
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.end(error.message);

            if (this._startup && this._startup.onError)
                this._startup.onError(error, httpContext);
        }
    }    
}

export namespace WebHost
{
    export interface Startup
    {
        onStart?(): void;
        onBeginRequest?(httpContext: HttpContext): void;
        onEndRequest?(httpContext: HttpContext): void;
        onError?(error: Error, httpContext: HttpContext): void;
    }
}