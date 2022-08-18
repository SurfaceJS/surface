import type ActionResult from "./action-result.js";
import type HttpContext  from "./http-context.js";
import JsonResult        from "./json-result.js";
import StatusCode        from "./status-code.js";
import ViewResult        from "./view-result.js";

export default abstract class Controller
{
    private readonly _httpContext: HttpContext;

    public get httpContext(): HttpContext
    {
        return this._httpContext;
    }

    public constructor(httpContext: HttpContext)
    {
        this._httpContext  = httpContext;
    }

    public json(data: unknown): ActionResult
    {
        return new JsonResult(this.httpContext, data);
    }

    public view(): ActionResult;
    public view(viewName:  string): ActionResult;
    public view(viewName:  string, model: unknown): ActionResult;
    public view(viewName?: string, model?: unknown): ActionResult
    {
        const name = (Object.getPrototypeOf(this).constructor as Function).name.replace(/controller$/i, "");

        return new ViewResult(this.httpContext, name, viewName ?? "index", model, StatusCode.Ok);
    }
}