import Enumerable       from "@surface/enumerable";
import type HttpContext from "./http-context.js";
import mymeType         from "./myme-types.js";
import RequestHandler   from "./request-handler.js";
import StatusCode       from "./status-code.js";

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

    public async handle(httpContext: HttpContext): Promise<boolean>
    {
        let filepath = this.path.resolve(httpContext.host.root, httpContext.host.wwwroot, this.fallbackRoute.replace(/^\/|\/$/g, ""));

        const targets =
        [
            filepath,
            `${filepath}.html`,
            `${filepath}.htm`,
            this.path.join(filepath, "index.html"),
            this.path.join(filepath, "index.htm"),
            this.path.join(filepath, "default.html"),
            this.path.join(filepath, "default.htm"),
        ];

        try
        {
            filepath = Enumerable.from(targets).first(x => this.fs.existsSync(x) && this.fs.lstatSync(x).isFile());
        }
        catch (error)
        {
            throw new Error("The provided fallback path is invalid.");
        }

        const extension = this.path.extname(filepath) as keyof typeof mymeType;
        const data      = await new Promise((resolve, reject) => this.fs.readFile(filepath, (error, data) => error ? reject(error) : resolve(data)));

        httpContext.response.writeHead(StatusCode.Ok, { "Content-Type": mymeType[extension] });
        httpContext.response.write(data);
        httpContext.response.end();

        return true;
    }
}