import { ServerConfiguration } from '../library/server-configuration';
import * as http               from 'http';

export type RoutePath = { route: string, routePaths: Array<RoutePath> };

export class Host
{    
    private config: ServerConfiguration;

    public constructor(config: ServerConfiguration)
    {
        this.config = config;
    }

    public static run(config: ServerConfiguration): void
    {
        new Host(config).run();
    }

    public run(): void
    {
        if (this.config.startup && this.config.startup.onStart)
            this.config.startup.onStart();

        http.createServer(this.listenerFactory()).listen(this.config.port);
    }

    private listenerFactory(): (this: http.Server, request: http.IncomingMessage, response: http.ServerResponse) => void
    {
        const self = this;
        return function (this: http.Server, request: http.IncomingMessage, response: http.ServerResponse): void
        {
            try
            {
                if (self.config.startup && self.config.startup.onBeginRequest)
                    self.config.startup.onBeginRequest(request);

                /*
                let routes = Route.from(self.config.routes.paths).normalized;
                
                if (request.url)
                {
                    let path = utils.resolveUrl(self.config.wwwroot, request.url, self.config.defaultRoute);

                    path = path || self.config.notFound || '';
                    utils.loadFile(response, path || '');
                }

                if (self.config.startup && self.config.startup.onEndRequest)
                    self.config.startup.onEndRequest(request, response);
                */
            }
            catch (error)
            {
                response.writeHead(404, { 'Content-Type': 'text/plain' });
                response.end(error.message);

                if (self.config.startup && self.config.startup.onError)
                    self.config.startup.onError(error, request, response);
            }
        }
    }
}