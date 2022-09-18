import fs               from "fs";
import path             from "path";
import ActionResult     from "./action-result.js";
import type HttpContext from "./http-context.js";
import mymeType         from "./myme-types.js";
import type StatusCode  from "./status-code.js";

export default class ViewResult extends ActionResult
{
    private readonly controllerName: string;
    private readonly model:          unknown;
    private readonly statusCode:     StatusCode;
    private readonly viewName:       string;

    public constructor(httpContext: HttpContext, controllerName: string,  viewName: string, model: unknown, statusCode: StatusCode)
    {
        super(httpContext);

        this.controllerName = controllerName;
        this.model          = model;
        this.statusCode     = statusCode;
        this.viewName       = viewName;

        // Todo: Used to prevent unused error. Remove later.
        console.log(this.model);
    }

    public executeResult(): void
    {
        const viewPath = path.join(this.httpContext.host.root, "views", this.controllerName, `${this.viewName}.html`);

        if (!fs.existsSync(viewPath))
        {
            throw new Error(`View ${this.viewName} cannot be founded.`);
        }

        const data = fs.readFileSync(viewPath);

        this.httpContext.response.writeHead(this.statusCode, { "Content-Type": mymeType[".html"] });
        this.httpContext.response.write(data);
        this.httpContext.response.end();
    }
}
