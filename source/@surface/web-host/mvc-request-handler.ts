import "@surface/reflection/extensions";

import Router                    from "@surface/router";
import { Constructor, Nullable } from "@surface/types";
import ActionResult              from "./action-result";
import Controller                from "./controller";
import HttpContext               from "./http-context";
import RequestHandler            from "./request-handler";

export default class MvcRequestHandler extends RequestHandler
{
    private readonly _router: Router;
    protected get router(): Router
    {
        return this._router;
    }

    public constructor(router: Router)
    {
        super();
        this._router = router;
    }

    private getController(controller: string, filepath: string): Constructor<Controller>
    {
        let esmodule = require(filepath) as object;

        let constructor: Nullable<Constructor<Controller>> = esmodule["default"]
            || esmodule.getType().extends(Controller) && esmodule
            || esmodule.getType().equals(Object) && Object.keys(esmodule)
                .asEnumerable()
                .where(x => new RegExp(`^${controller}(controller)?$`, "i").test(x) && (esmodule[x] as Object).getType().extends(Controller))
                .select(x => esmodule[x])
                .firstOrDefault();

        if (constructor)
        {
            return constructor;
        }

        throw new TypeError("Can't find an valid subclass of Controller.");
    }

    public handle(httpContext: HttpContext): boolean
    {
        if (httpContext.request.url)
        {
            let routeData = this.router.match(httpContext.request.url);

            if (routeData)
            {
                const { controller, action, id } = routeData.params;
                if (controller)
                {
                    let controllersPath = this.path.join(httpContext.host.root, "controllers");

                    let filepath =
                    [
                        this.path.join(controllersPath, `${controller}.js`),
                        this.path.join(controllersPath, `${controller}controller.js`),
                        this.path.join(controllersPath, `${controller}-controller.js`),
                    ]
                    .asEnumerable()
                    .firstOrDefault(x => this.fs.existsSync(x));

                    if (filepath)
                    {
                        let constructor = this.getController(controller, filepath);

                        let targetController = new constructor(httpContext);

                        let actionMethod = targetController.getType()
                            .getMethods()
                            .firstOrDefault(x => new RegExp(`^${httpContext.request.method}${action}|${action}$`, "i").test(x.key));

                        if (actionMethod)
                        {
                            let actionResult: ActionResult;

                            if (id)
                            {
                                actionResult = actionMethod.invoke.call(targetController, { id });
                            }
                            else
                            {
                                actionResult = actionMethod.invoke.call(targetController, routeData.search);
                            }

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