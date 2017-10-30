import { ActionResult } from '@surface/server/library/action-result';
import * as http        from 'http';

export class Controller
{
    private requestValue : http.IncomingMessage
    public get request(): http.IncomingMessage
    {
        return this.requestValue;
    }

    private responseValue : http.ServerResponse
    public get response(): http.ServerResponse
    {
        return this.responseValue;
    }

    public constructor(request: http.IncomingMessage, response: http.ServerResponse)
    {
        this.requestValue  = request;
        this.responseValue = response;
    }

    public view(): ActionResult
    {
        return new ActionResult();
    }
}