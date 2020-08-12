import HttpContext    from "./http-context";
import mymeType       from "./myme-types";
import RequestHandler from "./request-handler";
import StatusCode     from "./status-code";

export default class StaticRequestHandler extends RequestHandler
{
    public constructor()
    {
        super();
    }

    public async handle(httpContext: HttpContext): Promise<boolean>
    {
        if (httpContext.request.url)
        {
            const filepath = this.path.join(httpContext.host.root, httpContext.host.wwwroot, httpContext.request.url);
            if (this.path.extname(filepath) && this.fs.existsSync(filepath))
            {
                const extension = this.path.extname(filepath) as keyof typeof mymeType;
                const data      = this.fs.readFileSync(filepath);

                httpContext.response.writeHead(StatusCode.Ok, { "Content-Type": mymeType[extension] || mymeType[".html"] });
                httpContext.response.write(data);
                httpContext.response.end();

                return true;
            }
        }

        return Promise.resolve(false);
    }
}