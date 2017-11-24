import '@surface/reflection/extensions';

import { ActionResult } from './action-result';
import { Controller }   from './controller';
import { Handler }      from './handler';
import { HttpContext }  from './http-context';
import { Router }       from '@surface/router/index';
import { Constructor }  from '@surface/types';
import * as fs          from 'fs';
import * as path        from 'path';

export class MvcHandler extends Handler
{
    private _router: Router
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
                    let filepath = path.join(httpContext.host.root, 'controllers', `${routeData.params.controller}-controller.js`);
                    if (fs.existsSync(filepath))
                    {
                        let ControllerConstructor = require(filepath).default as Constructor<Controller>;
                        let targetController = new ControllerConstructor(httpContext);

                        let actionMethod = targetController.reflect().getMethod(action, true);

                        if (actionMethod)
                        {
                            let actionResult: ActionResult;
                            
                            if (id)
                                actionResult = actionMethod.call(targetController, { id });
                            else
                                actionResult = actionMethod.call(targetController, routeData.search);

                            actionResult.executeResult();

                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }
}