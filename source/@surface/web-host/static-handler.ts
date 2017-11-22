import * as common     from './common';
import { Handler }     from './handler';
import { HttpContext } from './http-context';
import * as fs         from 'fs';
import * as path       from 'path';

export class StaticHandler extends Handler
{
    public handle(httpContext: HttpContext): boolean
    {
        if (httpContext.request.url)
        {
            let filepath = path.join(httpContext.host.root, httpContext.host.wwwroot, httpContext.request.url);
            if (path.extname(filepath) && fs.existsSync(filepath))
            {
                common.loadFile(httpContext.response, filepath);
                return true;
            }
            else
            {
                return false;
            }
        }
        else
        {
            return false;
        }
    }
}