import { StatusCode }     from "./enums";
import { RequestHandler } from "./request-handler";
import { HttpContext }    from "./http-context";
import { mymeType }       from "./variables";

export class StaticRequestHandler extends RequestHandler
{
    public constructor()
    {
        super();
    }

    public handle(httpContext: HttpContext): boolean
    {
        if (httpContext.request.url)
        {
            let filepath = this.path.join(httpContext.host.root, httpContext.host.wwwroot, httpContext.request.url);
            if (this.path.extname(filepath) && this.fs.existsSync(filepath))
            {
                let extension = this.path.extname(filepath);
                let data      = this.fs.readFileSync(filepath);

                httpContext.response.writeHead(StatusCode.ok, { "Content-Type": mymeType[extension] || mymeType[".html"] });
                httpContext.response.write(data);
                httpContext.response.end();

                return true;
            }
        }

        return false;
    }
}