import { StatusCode }     from './enums';
import { RequestHandler } from './request-handler';
import { HttpContext }    from './http-context';
import { mymeType }       from './variables';
import * as fs            from 'fs';
import * as path          from 'path';

export class FallbackRequestHandler extends RequestHandler
{
    private _fallbackRoute: string;
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
        let filepath = path.resolve(httpContext.host.root, httpContext.host.wwwroot, this._fallbackRoute.replace(/^\/|\/$/g, ''));

        let targets =
        [
            filepath,
            filepath + '.html',
            filepath + '.htm',
            path.join(filepath, 'index.html'),
            path.join(filepath, 'index.htm'),
            path.join(filepath, 'default.html'),
            path.join(filepath, 'default.htm')
        ];

        try
        {
            filepath = targets.asEnumerable().first(x => fs.existsSync(x) && fs.lstatSync(x).isFile());
        }
        catch (error)
        {
            throw new Error('The provided fallback path is invalid.');
        }

        let extension = path.extname(filepath);
        let data      = fs.readFileSync(filepath);

        httpContext.response.writeHead(StatusCode.ok, { 'Content-Type': mymeType[extension] });
        httpContext.response.write(data);
        httpContext.response.end();

        return true;
    }
}