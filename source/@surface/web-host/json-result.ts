import { ActionResult } from './action-result';
import { HttpContext }  from './http-context';
import { mymeType }     from './variables';
import { Nullable }     from '@surface/types';
import { StatusCode } from './enums';

export class JsonResult extends ActionResult
{
    private _data: Nullable<object>;
    public constructor(httpContext: HttpContext, data: Nullable<object>)
    {
        super(httpContext);
        this._data = data;
    }

    public executeResult(): void
    {
        this.httpContext.response.writeHead(StatusCode.ok, { "Content-Type": mymeType['.json'] });
        this.httpContext.response.write(JSON.stringify(this._data));
        this.httpContext.response.end();
    }
}