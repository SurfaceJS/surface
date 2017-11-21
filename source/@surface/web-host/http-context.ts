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

    private _serverRoot: string
    public get serverRoot(): string
    {
        return this._serverRoot;
    }

    public constructor(request: http.IncomingMessage, response: http.ServerResponse, serverRoot: string)
    {
        this._request    = request;
        this._response   = response;
        this._serverRoot = serverRoot;
    }
}