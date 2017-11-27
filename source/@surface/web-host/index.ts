import { Configuration }          from './configuration';
import { StatusCode }             from './enums';
import { FallbackRequestHandler } from './fallback-request-handler';
import { RequestHandler }         from './request-handler';
import { HttpContext }            from './http-context';
import { StaticRequestHandler }   from './static-request-handler';
import { MvcRequestHandler }      from './mvc-request-handler';
import { IStartup }               from './types';
import { List }                   from '@surface/collection/list';
import { Router }                 from '@surface/router';
import * as http                  from 'http';

export class WebHost
{
    private _startup: IStartup;
    private _handlers: List<RequestHandler>;

    private static _instance: WebHost;
    public static get instance(): WebHost
    {
        return this._instance;
    }

    private _port: number;
    public get port(): number
    {
        return this._port;
    }

    private _root: string;
    public get root(): string
    {
        return this._root;
    }

    private _wwwroot: string;
    public get wwwroot(): string
    {
        return this._wwwroot;
    }

    private constructor(configuration: Configuration)
    {
        this._root    = configuration.serverRoot;
        this._port    = configuration.port;
        this._wwwroot = configuration.wwwroot;

        this._handlers = new List();
    }

    public run(): void
    {
        if (this._startup && this._startup.onStart)
        {
            this._startup.onStart();
        }

        http.createServer(this.listener.bind(this)).listen(this._port);
    }

    public useFallBack(fallbackRoute: string): WebHost
    {
        this._handlers.add(new FallbackRequestHandler(fallbackRoute));
        return this;
    }

    public useMvc(router: Router): WebHost
    {
        this._handlers.add(new MvcRequestHandler(router));
        return this;
    }

    public useStatic(): WebHost
    {
        this._handlers.add(new StaticRequestHandler());
        return this;
    }

    public useStartup<T extends IStartup>(startup: T): WebHost
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
            {
                this._startup.onBeginRequest(httpContext);
            }

            if (this._handlers.any(x => x.handle(httpContext)))
            {
                response.writeHead(StatusCode.notFound, { 'Content-Type': 'text/plain' });
                response.end('Resource not found.');
            }
            
            if (this._startup && this._startup.onEndRequest)
            {
                this._startup.onEndRequest(httpContext);
            }
        }
        catch (error)
        {
            response.writeHead(StatusCode.internalServerError, { 'Content-Type': 'text/plain' });
            response.end(error.message);

            if (this._startup && this._startup.onError)
            {
                this._startup.onError(error, httpContext);
            }
        }
    }
}