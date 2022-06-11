import { URL, pathToFileURL }        from "url";
import type { Constructor, Indexer } from "@surface/core";
import Enumerable                    from "@surface/enumerable";
import { Type }                      from "@surface/reflection";
import type Router                   from "@surface/router";
import type ActionResult             from "./action-result.js";
import Controller                    from "./controller.js";
import type HttpContext              from "./http-context.js";
import RequestHandler                from "./request-handler.js";

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

    private async getController(controller: string, filepath: string): Promise<Constructor<Controller>>
    {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const esModule = await import(pathToFileURL(filepath).href) as Indexer<Constructor<Controller> | null>;

        let constructor: Constructor<Controller> | null | undefined;

        if (!(constructor = esModule.default))
        {
            if (Type.from(esModule).extends(Controller))
            {
                constructor = esModule as object as Constructor<Controller>;
            }
            else if (Type.from(esModule).equals(Object))
            {
                constructor = Enumerable.from(Object.keys(esModule))
                    .where(x => new RegExp(`^${controller}(controller)?$`, "i").test(x) && Type.of(esModule[x] as Function).extends(Controller))
                    .select(x => esModule[x])
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
            },
        );

        return new Promise(resolve => httpContext.request.on("end", () => resolve(body.length > 0 ? JSON.parse(body) : null)));
    }

    public async handle(httpContext: HttpContext): Promise<boolean>
    {
        if (httpContext.request.url)
        {
            const url = new URL(httpContext.request.url, "http:localhost");

            const match = this.router.match(url.pathname);

            if (match.matched)
            {
                const routeData = match.value;

                const { controller, action, id } = routeData.parameters as Indexer<string>;

                if (controller)
                {
                    const controllersPath = this.path.join(httpContext.host.root, "controllers");

                    const filepath = Enumerable.from
                    ([
                        this.path.join(controllersPath, `${controller}.js`),
                        this.path.join(controllersPath, `${controller}controller.js`),
                        this.path.join(controllersPath, `${controller}-controller.js`),
                    ]).firstOrDefault(x => this.fs.existsSync(x));

                    if (filepath)
                    {
                        const constructor = await this.getController(controller, filepath);

                        const targetController = new constructor(httpContext);

                        const actionMethod = Enumerable.from(Type.from(targetController).getMethods())
                            .firstOrDefault(x => typeof x.key == "string" && new RegExp(`^${httpContext.request.method}${action}|${action}$`, "i").test(x.key));

                        if (actionMethod)
                        {
                            const postData = await this.parseBody(httpContext);

                            const inbound = { ...Object.fromEntries(url.searchParams.entries()), ...postData } as Indexer;

                            if (id)
                            {
                                inbound.id = id;
                            }

                            const actionResult = actionMethod.invoke.call(targetController, inbound) as ActionResult;

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
