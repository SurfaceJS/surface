import ActionResult from "./action-result";
import HttpContext  from "./http-context";
import JsonResult   from "./json-result";
import StatusCode   from "./status-code";
import ViewResult   from "./view-result";

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

        return new ViewResult(this.httpContext, name, viewName || "index", model, StatusCode.ok);
    }
}