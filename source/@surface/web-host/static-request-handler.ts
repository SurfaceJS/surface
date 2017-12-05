import { StatusCode }     from "./enums";
import { RequestHandler } from "./request-handler";
import { HttpContext }    from "./http-context";
import { mymeType }       from "./variables";
import * as fs            from "fs";
import * as path          from "path";

export class StaticRequestHandler extends RequestHandler
{
    public handle(httpContext: HttpContext): boolean
    {
        if (httpContext.request.url)
        {
            let filepath = path.join(httpContext.host.root, httpContext.host.wwwroot, httpContext.request.url);
            if (path.extname(filepath) && fs.existsSync(filepath))
            {
                let extension = path.extname(filepath);
                let data      = fs.readFileSync(filepath);

                httpContext.response.writeHead(StatusCode.ok, { "Content-Type": mymeType[extension] });
                httpContext.response.write(data);
                httpContext.response.end();

                return true;
            }
        }

        return false;
    }
}