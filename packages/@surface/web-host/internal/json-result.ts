import ActionResult     from "./action-result.js";
import type HttpContext from "./http-context.js";
import mymeType         from "./myme-types.js";
import StatusCode       from "./status-code.js";

export default class JsonResult extends ActionResult
{
    private readonly data: unknown;

    public constructor(httpContext: HttpContext, data: unknown)
    {
        super(httpContext);
        this.data = data;
    }

    public executeResult(): void
    {
        this.httpContext.response.writeHead(StatusCode.Ok, { "Content-Type": mymeType[".json"] });
        this.httpContext.response.write(JSON.stringify(this.data));
        this.httpContext.response.end();
    }
}