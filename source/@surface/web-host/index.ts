import { HttpContext }         from './http-context';
import * as common             from './common';
import { Configuration }       from './configuration';
import { Controller }          from './controller';
import { Router, RoutingType } from '@surface/router';
import * as fs                 from 'fs';
import * as path               from 'path';
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
        this.router = Router.create(RoutingType.Abstract, config.routes.asEnumerable().select(x => x.path).toArray());
    }

    public run(): void
    {
        if (this.startup && this.startup.onStart)
            this.startup.onStart();

        http.createServer(this.listener.bind(this)).listen(this.config.port);
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

    private async listener(request: http.IncomingMessage, response: http.ServerResponse): Promise<void>
    {
        try
        {
            if (this.startup && this.startup.onBeginRequest)
                this.startup.onBeginRequest(request);
            
            if (request.url)
            {
                let filepath = path.join(this.config.wwwroot, request.url);
                if (request.url != '/' || path.extname(filepath) && fs.existsSync(filepath))
                {
                    common.loadFile(response, filepath);
                }
                else
                {
                    let match = this.router.match(request.url);

                    if (match)
                    {
                        const { controller, action, id } = match.params;
                        if (controller)
                        {
                            filepath = path.join(this.config.context, 'controllers', match.params.controller + '-controller');
                            if (fs.existsSync(filepath + '.js'))
                            {
                                let ControllerConstructor = require(filepath) as typeof Controller;
                                let targetController = new ControllerConstructor(new HttpContext(request, response));

                                if (action && targetController[action])
                                {
                                    if (id)
                                    {
                                        targetController[action]({ id });
                                    }
                                    else
                                    {
                                        targetController[action]();
                                    }
                                }
                            }
                            else
                            {
                                throw new Error(`Conttroler ${controller} cannot be found.`);
                            }
                        }
                    }
                    else
                    {
                        let fallback = this.config.routes.asEnumerable().firstOrDefault(x => !!x.fallback);
                        
                        if (fallback)
                            common.loadFile(response, common.resolveFallback(fallback.path));
                    }
                }
            }
        }
        catch (error)
        {
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.end(error.message);

            if (this.startup && this.startup.onError)
                this.startup.onError(error, request, response);
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