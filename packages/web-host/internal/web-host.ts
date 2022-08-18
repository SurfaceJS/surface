import http                   from "http";
import { List }               from "@surface/collection";
import { resolveError }       from "@surface/core";
import type Router            from "@surface/router";
import type Configuration     from "./configuration.js";
import FallbackRequestHandler from "./fallback-request-handler.js";
import HttpContext            from "./http-context.js";
import type IStartup          from "./interfaces/startup.js";
import MvcRequestHandler      from "./mvc-request-handler.js";
import type RequestHandler    from "./request-handler.js";
import StaticRequestHandler   from "./static-request-handler.js";
import StatusCode             from "./status-code.js";

export default class WebHost
{
    private static _instance: WebHost;

    private readonly _port:    number;
    private readonly _root:    string;
    private readonly _wwwroot: string;

    private readonly handlers: List<RequestHandler>;

    private startup: IStartup | null = null;

    public static get instance(): WebHost
    {
        return this._instance;
    }

    public get port(): number
    {
        return this._port;
    }

    public get root(): string
    {
        return this._root;
    }

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
            this.startup?.onBeginRequest?.(httpContext);

            let handled = false;

            for (const handler of this.handlers)
            {
                if (handled = await handler.handle(httpContext))
                {
                    break;
                }
            }

            if (!handled)
            {
                response.writeHead(StatusCode.NotFound, { "Content-Type": "text/plain" });
                response.end("Resource not found.");
            }

            this.startup?.onEndRequest?.(httpContext);
        }
        catch (e)
        {
            const error = resolveError(e);

            response.writeHead(StatusCode.InternalServerError, { "Content-Type": "text/plain" });
            response.end(error.message);

            this.startup?.onError?.(error, httpContext);
        }
    }

    public run(): void
    {
        this.startup?.onStart?.();

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