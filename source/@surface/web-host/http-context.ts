import * as http from 'http';

export class HttpContext
{
    private _request: http.IncomingMessage
    public get request(): http.IncomingMessage
    {
        return this._request;
    }
    
    private _response: http.ServerResponse
    public get response(): http.ServerResponse
    {
        return this._response;
    }

    public constructor(request: http.IncomingMessage, response: http.ServerResponse)
    {
        this._request = request;
        this._response = response;
    }
}