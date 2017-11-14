import { ActionResult } from './action-result';
import { HttpContext }  from './http-context';

export class Controller
{
    private _httpContext: HttpContext
    public get httpContext(): HttpContext
    {
        return this._httpContext;
    }

    public constructor(httpContext: HttpContext)
    {
        this._httpContext  = httpContext;
    }

    public view(): ActionResult
    {
        return new ActionResult();
    }
}