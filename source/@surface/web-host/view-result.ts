import { ActionResult } from "./action-result";
import { StatusCode }   from "./enums";
import { HttpContext }  from "./http-context";
import { mymeType }     from "./variables";
import { Nullable }     from "@surface/types";
import * as fs          from "fs";
import * as path        from "path";

export class ViewResult extends ActionResult
{
    private readonly controllerName: string;
    private readonly model:          Nullable<object>;
    private readonly statusCode:     StatusCode;
    private readonly viewName:       string;

    public constructor(httpContext: HttpContext, controllerName: string,  viewName: string, model:  Nullable<object>, statusCode: StatusCode)
    {
        super(httpContext);

        this.controllerName = controllerName;
        this.model          = model;
        this.statusCode     = statusCode;
        this.viewName       = viewName;

        console.log(this.model); // Todo: Used to prevent unused error. Remove later.
    }

    public executeResult(): void
    {
        let viewpath = path.join(this.httpContext.host.root, "views", this.controllerName, `${this.viewName}.html`);

        if (!fs.existsSync(viewpath))
        {
            throw new Error(`View ${this.viewName} cannot be founded.`);
        }

        let data = fs.readFileSync(viewpath);

        this.httpContext.response.writeHead(this.statusCode, { "Content-Type": mymeType[".html"] });
        this.httpContext.response.write(data);
        this.httpContext.response.end();
    }
}