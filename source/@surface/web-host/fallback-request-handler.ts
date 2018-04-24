import Enumerable     from "@surface/enumerable";
import HttpContext    from "./http-context";
import RequestHandler from "./request-handler";
import StatusCode     from "./status-code";
import { mymeType }   from "./variables";

export default class FallbackRequestHandler extends RequestHandler
{
    private readonly _fallbackRoute: string;
    public get fallbackRoute(): string
    {
        return this._fallbackRoute;
    }

    public constructor(fallbackRoute: string)
    {
        super();
        this._fallbackRoute = fallbackRoute;
    }

    public handle(httpContext: HttpContext): boolean
    {
        let filepath = this.path.resolve(httpContext.host.root, httpContext.host.wwwroot, this.fallbackRoute.replace(/^\/|\/$/g, ""));

        let targets =
        [
            filepath,
            filepath + ".html",
            filepath + ".htm",
            this.path.join(filepath, "index.html"),
            this.path.join(filepath, "index.htm"),
            this.path.join(filepath, "default.html"),
            this.path.join(filepath, "default.htm")
        ];

        try
        {
            filepath = Enumerable.from(targets).first(x => this.fs.existsSync(x) && this.fs.lstatSync(x).isFile());
        }
        catch (error)
        {
            throw new Error("The provided fallback path is invalid.");
        }

        let extension = this.path.extname(filepath);
        let data      = this.fs.readFileSync(filepath);

        httpContext.response.writeHead(StatusCode.ok, { "Content-Type": mymeType[extension] });
        httpContext.response.write(data);
        httpContext.response.end();

        return true;
    }
}