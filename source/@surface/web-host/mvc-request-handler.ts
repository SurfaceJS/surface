import '@surface/reflection/extensions';

import { ActionResult }          from './action-result';
import { Controller }            from './controller';
import { RequestHandler }        from './request-handler';
import { HttpContext }           from './http-context';
import { Router }                from '@surface/router/index';
import { Constructor, Nullable } from '@surface/types';
import * as fs                   from 'fs';
import * as path                 from 'path';

export class MvcRequestHandler extends RequestHandler
{
    private _router: Router;
    protected get routes(): Router
    {
        return this._router;
    }

    public constructor(router: Router)
    {
        super();
        this._router = router;
    }

    public handle(httpContext: HttpContext): boolean
    {
        if (httpContext.request.url)
        {
            let routeData = this._router.match(httpContext.request.url);
            
            if (routeData)
            {
                const { controller, action, id } = routeData.params;
                if (controller)
                {
                    let controllersPath = path.join(httpContext.host.root, 'controllers');
                    
                    let filepath =
                    [
                        path.join(controllersPath, `${controller}.js`),
                        path.join(controllersPath, `${controller}controller.js`),
                        path.join(controllersPath, `${controller}-controller.js`),
                    ]
                    .asEnumerable()
                    .firstOrDefault(x => fs.existsSync(x));

                    if (filepath)
                    {
                        let esmodule = require(filepath) as object;

                        let controllerConstructor: Nullable<Constructor> = esmodule['default'] || esmodule.reflect()
                            .getMethods()
                            .firstOrDefault(x => new RegExp(`^${controller}(controller)?$`, 'i').test(x.name));

                        if (controllerConstructor && controllerConstructor.prototype instanceof Controller)
                        {
                            let targetController = new controllerConstructor(httpContext);

                            let actionMethod = targetController.reflect().getMethod(action);

                            if (actionMethod)
                            {
                                let actionResult: ActionResult;
                                
                                if (id)
                                {
                                    actionResult = actionMethod.call(targetController, { id });
                                }
                                else
                                {
                                    actionResult = actionMethod.call(targetController, routeData.search);
                                }

                                actionResult.executeResult();

                                return true;
                            }
                        }
                        else
                        {
                            throw new TypeError('Constructor is not an valid subclass of @surface/web-host/controller.');
                        }
                    }
                }
            }
        }

        return false;
    }
}