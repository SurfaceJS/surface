import { Configuration }       from '@surface/web-host/configuration';
import * as utils              from '@surface/web-host/utils';
import { Router, RoutingType } from '@surface/router';
import * as http               from 'http';

export class WebHost
{
    private config:  Configuration;
    private startup: WebHost.Startup;
    private router:  Router;

    private static _instance: WebHost
    public static get instance(): WebHost
    {
        return this._instance;
    }

    private constructor(config: Configuration)
    {
        this.config = config;
        this.router = Router.create(RoutingType.Abstract, config.routes.paths);
    }

    public run(): void
    {
        if (this.startup && this.startup.onStart)
            this.startup.onStart();

        http.createServer(this.listenerFactory()).listen(this.config.port);
    }

    public useStartup<T extends WebHost.Startup>(startup: T): WebHost
    {
        this.startup = startup;
        return this;
    }

    public static create(config: Configuration): WebHost
    {
        WebHost._instance = new WebHost(config);
        return WebHost._instance;
    }

    private listenerFactory(): (this: http.Server, request: http.IncomingMessage, response: http.ServerResponse) => void
    {
        const self = this;
        return function (this: http.Server, request: http.IncomingMessage, response: http.ServerResponse): void
        {
            try
            {
                if (self.startup && self.startup.onBeginRequest)
                    self.startup.onBeginRequest(request);
                
                if (request.url)
                {
                    let match = self.router.match(request.url)

                    console.log(match);

                    let path = utils.resolveUrl(self.config.wwwroot, request.url, '/app');

                    //path = path || self.config.notFound || '';
                    utils.loadFile(response, path || '');
                }

                /*
                if (self.config.startup && self.config.startup.onEndRequest)
                    self.config.startup.onEndRequest(request, response);
                */
            }
            catch (error)
            {
                response.writeHead(404, { 'Content-Type': 'text/plain' });
                response.end(error.message);

                if (self.startup && self.startup.onError)
                    self.startup.onError(error, request, response);
            }
        }
    }
}

export namespace WebHost
{
    export interface Startup
    {
        onStart?(): void;
        onBeginRequest?(request: http.IncomingMessage): void;
        onEndRequest?(request: http.IncomingMessage, response: http.ServerResponse): void;
        onError?(error: Error, request: http.IncomingMessage, response: http.ServerResponse): void;
    }
}