import { ActionResult } from './action-result';
import { Controller }   from './controller';
import { Handler }      from './handler';
import { HttpContext }  from './http-context';
import { Constructor }  from '@surface/types';
import * as fs          from 'fs';
import * as path        from 'path';

export class MvcHandler extends Handler
{
    public handle(httpContext: HttpContext): boolean
    {
        if (httpContext.request.url)
        {
            let match = httpContext.host.router.match(httpContext.request.url);
            
            if (match)
            {
                const { controller, action, id } = match.params;
                if (controller)
                {
                    let filepath = path.join(httpContext.host.root, 'controllers', `${match.params.controller}-controller.js`);
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
                                actionResult = actionMethod.call(targetController, match.search);

                            actionResult.executeResult();
                        }
                        else
                        {
                            httpContext.response.writeHead(500, { 'Content-Type': 'text/plain' });
                            httpContext.response.end(`Action ${action} cannot be found.`);
                        }
                    }
                    else
                    {
                        httpContext.response.writeHead(404, { 'Content-Type': 'text/plain' });
                        httpContext.response.end(`Controller ${controller} cannot be found.`);
                    }
                }
            }
            else
            {
                return false;
            }
        }
        else
        {
            return false;
        }

        return true;
    }
}