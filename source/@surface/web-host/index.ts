import Configuration          from "./configuration";
import FallbackRequestHandler from "./fallback-request-handler";
import HttpContext            from "./http-context";
import MvcRequestHandler      from "./mvc-request-handler";
import RequestHandler         from "./request-handler";
import IStartup               from "./interfaces/startup";
import StaticRequestHandler   from "./static-request-handler";
import StatusCode             from "./status-code";

import List         from "@surface/collection/list";
import Router       from "@surface/router";
import { Nullable } from "@surface/types";

import http from "http";

export default class WebHost
{
    private static _instance: WebHost;
    public static get instance(): WebHost
    {
        return this._instance;
    }

    private readonly handlers: List<RequestHandler>;
    private startup: Nullable<IStartup>;

    private readonly _port: number;
    public get port(): number
    {
        return this._port;
    }

    private readonly _root: string;
    public get root(): string
    {
        return this._root;
    }

    private readonly _wwwroot: string;
    public get wwwroot(): string
    {
        return this._wwwroot;
    }

    private constructor(configuration: Configuration)
    {
        this._root    = configuration.serverRoot;
        this._port    = configuration.port;
        this._wwwroot = configuration.wwwroot;

        this.handlers = new List();
    }

    public static configure(configuration: Configuration): WebHost
    {
        return WebHost._instance = WebHost._instance || new WebHost(configuration);
    }

    private async listener(request: http.IncomingMessage, response: http.ServerResponse): Promise<void>
    {
        const httpContext = new HttpContext(this, request, response);

        try
        {
            if (this.startup && this.startup.onBeginRequest)
            {
                this.startup.onBeginRequest(httpContext);
            }

            if (this.handlers.any(x => x.handle(httpContext)))
            {
                response.writeHead(StatusCode.notFound, { "Content-Type": "text/plain" });
                response.end("Resource not found.");
            }

            if (this.startup && this.startup.onEndRequest)
            {
                this.startup.onEndRequest(httpContext);
            }
        }
        catch (error)
        {
            response.writeHead(StatusCode.internalServerError, { "Content-Type": "text/plain" });
            response.end(error.message);

            if (this.startup && this.startup.onError)
            {
                this.startup.onError(error, httpContext);
            }
        }
    }

    public run(): void
    {
        if (this.startup && this.startup.onStart)
        {
            this.startup.onStart();
        }

        http.createServer(this.listener.bind(this)).listen(this.port);
    }

    public useFallBack(fallbackRoute: string): WebHost
    {
        this.handlers.add(new FallbackRequestHandler(fallbackRoute));
        return this;
    }

    public useMvc(router: Router): WebHost
    {
        this.handlers.add(new MvcRequestHandler(router));
        return this;
    }

    public useStatic(): WebHost
    {
        this.handlers.add(new StaticRequestHandler());
        return this;
    }

    public useStartup<T extends IStartup>(startup: T): WebHost
    {
        this.startup = startup;
        return this;
    }
}