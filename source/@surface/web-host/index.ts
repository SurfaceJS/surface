import '@surface/reflection/extensions';

import { HttpContext }         from './http-context';
import * as common             from './common';
import { Configuration }       from './configuration';
import { Controller }          from './controller';
import { Router, RoutingType } from '@surface/router';
import * as fs                 from 'fs';
import * as path               from 'path';
import * as http               from 'http';
import { Constructor }         from '@surface/types';
import { ActionResult }        from '@surface/web-host/action-result';

export class WebHost
{
    private _configuration: Configuration;
    private _startup:       WebHost.Startup;
    private _router:        Router;

    private static _instance: WebHost
    public static get instance(): WebHost
    {
        return this._instance;
    }

    private constructor(config: Configuration)
    {
        this._configuration = config;
        this._router        = Router.create(RoutingType.Abstract, config.routes.asEnumerable().select(x => x.path).toArray());
    }

    public run(): void
    {
        if (this._startup && this._startup.onStart)
            this._startup.onStart();

        http.createServer(this.listener.bind(this)).listen(this._configuration.port);
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
        try
        {
            if (this._startup && this._startup.onBeginRequest)
                this._startup.onBeginRequest(request);
            
            if (request.url)
            {
                let filepath = path.join(this._configuration.wwwroot, request.url);
                if (path.extname(filepath) && fs.existsSync(filepath))
                {
                    common.loadFile(response, filepath);
                }
                else
                {
                    let match = this._router.match(request.url);

                    if (match)
                    {
                        const { controller, action, id } = match.params;
                        if (controller)
                        {
                            filepath = path.join(this._configuration.context, 'controllers', `${match.params.controller}-controller.js`);
                            if (fs.existsSync(filepath))
                            {
                                let ControllerConstructor = require(filepath).default as Constructor<Controller>;
                                let targetController = new ControllerConstructor(new HttpContext(request, response, this._configuration.context));

                                let actionMethod = targetController.reflect().getMethod(action, true);

                                if (actionMethod)
                                {
                                    let actionResult: ActionResult;
                                    
                                    if (id)
                                        actionResult = actionMethod.call(targetController, { id });
                                    else
                                        actionResult = actionMethod.call(targetController, match.search);

                                    actionResult.executeResult();
                                }
                                else
                                {
                                    response.writeHead(500, { 'Content-Type': 'text/plain' });
                                    response.end(`Action ${action} cannot be found.`);
                                }
                            }
                            else
                            {
                                response.writeHead(404, { 'Content-Type': 'text/plain' });
                                response.end(`Controller ${controller} cannot be found.`);
                            }
                        }
                    }
                    else
                    {
                        let fallback = this._configuration.routes.asEnumerable().firstOrDefault(x => !!x.fallback);
                        
                        if (fallback)
                            common.loadFile(response, common.resolveFallback(path.join(this._configuration.wwwroot, fallback.path)));
                    }
                }
            }
        }
        catch (error)
        {
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.end(error.message);

            if (this._startup && this._startup.onError)
                this._startup.onError(error, request, response);
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