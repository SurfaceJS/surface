import ActionResult from "./action-result";
import HttpContext  from "./http-context";
import mymeType     from "./myme-types";
import StatusCode   from "./status-code";

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