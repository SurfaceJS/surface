import ActionResult from "./action-result";
import HttpContext  from "./http-context";
import StatusCode   from "./status-code";
import { mymeType } from "./variables";

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
        this.httpContext.response.writeHead(StatusCode.ok, { "Content-Type": mymeType[".json"] });
        this.httpContext.response.write(JSON.stringify(this.data));
        this.httpContext.response.end();
    }
}