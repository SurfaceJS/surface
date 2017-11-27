import { ActionResult } from './action-result';
import { StatusCode }   from './enums';
import { HttpContext }  from './http-context';
import { mymeType }     from './variables';
import { Nullable }     from '@surface/types';
import * as fs          from 'fs';
import * as path        from 'path';

export class ViewResult extends ActionResult
{
    private _controllerName: string;
    private _model:          Nullable<object>;
    private _statusCode:     StatusCode;
    private _viewName:       string;

    public constructor(httpContext: HttpContext, controllerName: string,  viewName: string, model:  Nullable<object>, statusCode: StatusCode)
    {
        super(httpContext);

        this._controllerName = controllerName;
        this._model          = model;
        this._statusCode     = statusCode;
        this._viewName       = viewName;

        console.log(this._model); // Todo: Used to prevent unused error. Remove later.
    }

    public executeResult(): void
    {
        let viewpath = path.join(this.httpContext.host.root, 'views', this._controllerName, `${this._viewName}.html`);

        if (!fs.existsSync(viewpath))
        {
            throw new Error(`View ${this._viewName} cannot be founded.`);
        }

        let data = fs.readFileSync(viewpath);
        
        this.httpContext.response.writeHead(this._statusCode, { "Content-Type": mymeType['.html'] });
        this.httpContext.response.write(data);
        this.httpContext.response.end();
    }
}