import { Constructor, Nullable } from "@surface/core";
import Enumerable                from "@surface/enumerable";
import Type                      from "@surface/reflection/type";
import Router                    from "@surface/router";
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
            || Type.from(esmodule).extends(Controller) && esmodule
            || Type.from(esmodule).equals(Object) && Enumerable.from(Object.keys(esmodule))
                .where(x => new RegExp(`^${controller}(controller)?$`, "i").test(x) && Type.from(esmodule[x]).extends(Controller))
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
            const routeData = this.router.match(httpContext.request.url);

            if (routeData)
            {
                const { controller, action, id } = routeData.params;
                if (controller)
                {
                    const controllersPath = this.path.join(httpContext.host.root, "controllers");

                    const filepath = Enumerable.from
                        ([
                            this.path.join(controllersPath, `${controller}.js`),
                            this.path.join(controllersPath, `${controller}controller.js`),
                            this.path.join(controllersPath, `${controller}-controller.js`),
                        ])
                        .firstOrDefault(x => this.fs.existsSync(x));

                    if (filepath)
                    {
                        const constructor = this.getController(controller, filepath);

                        const targetController = new constructor(httpContext);

                        const actionMethod = Enumerable.from(Type.from(targetController).getMethods())
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