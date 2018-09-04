import { Constructor, Nullable, ObjectLiteral } from "@surface/core";
import Enumerable                               from "@surface/enumerable";
import Type                                     from "@surface/reflection/type";
import Router                                   from "@surface/router";
import ActionResult                             from "./action-result";
import Controller                               from "./controller";
import HttpContext                              from "./http-context";
import RequestHandler                           from "./request-handler";

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
        const esmodule = require(filepath) as ObjectLiteral<Nullable<Constructor<Controller>>>;

        let constructor: Nullable<Constructor<Controller>>;

        if (!(constructor = esmodule["default"]))
        {
            if (Type.from(esmodule).extends(Controller))
            {
                constructor = esmodule as object as Constructor<Controller>;
            }
            else if (Type.from(esmodule).equals(Object))
            {
                constructor = Enumerable.from(Object.keys(esmodule))
                    .where(x => new RegExp(`^${controller}(controller)?$`, "i").test(x) && Type.of(esmodule[x] as Function).extends(Controller))
                    .select(x => esmodule[x])
                    .firstOrDefault();
            }
        }

        if (constructor)
        {
            return constructor;
        }

        throw new TypeError("Can't find an valid subclass of Controller.");
    }

    private async parseBody(httpContext: HttpContext): Promise<Object>
    {
        let body = "";
        httpContext.request.on
        (
            "data",
            chunk =>
            {
                body += chunk.toString();

                if (body.length > 1e6)
                {
                    httpContext.request.connection.destroy();
                }
            }
        );

        return await new Promise(resolve => httpContext.request.on("end", () => resolve(JSON.parse(body))));
    }

    public async handle(httpContext: HttpContext): Promise<boolean>
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
                            .firstOrDefault(x => typeof x.key == "string" && new RegExp(`^${httpContext.request.method}${action}|${action}$`, "i").test(x.key));

                        if (actionMethod)
                        {
                            let actionResult: ActionResult;

                            const postData = await this.parseBody(httpContext);

                            const inbound = { ...routeData.search, ...postData } as ObjectLiteral;

                            if (id)
                            {
                                inbound["id"] = id;
                            }

                            actionResult = actionMethod.invoke.call(targetController, inbound);

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