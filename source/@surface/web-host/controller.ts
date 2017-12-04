import { ActionResult } from './action-result';
import { StatusCode }   from './enums';
import { HttpContext }  from './http-context';
import { JsonResult }   from './json-result';
import { ViewResult }   from './view-result';
import { Nullable }     from '@surface/types';

export abstract class Controller
{
    private _httpContext: HttpContext;
    public get httpContext(): HttpContext
    {
        return this._httpContext;
    }

    public constructor(httpContext: HttpContext)
    {
        this._httpContext  = httpContext;
    }

    public json(data: Nullable<Object>): ActionResult
    {
        return new JsonResult(this._httpContext, data);
    }

    public view(): ActionResult;
    public view(viewName:  string): ActionResult;
    public view(viewName:  string, model: Nullable<Object>): ActionResult;
    public view(viewName?: string, model?: Nullable<Object>): ActionResult
    {
        let controllerName = this['__proto__']['constructor']['name'] as string;

        controllerName = controllerName.replace(/controller$/i, '');

        return new ViewResult(this._httpContext, controllerName, viewName || 'index', model, StatusCode.ok);
    }
}