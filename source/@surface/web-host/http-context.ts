import http        from "http";
import { WebHost } from "./index";

export class HttpContext
{
    private readonly _request: http.IncomingMessage;
    public get request(): http.IncomingMessage
    {
        return this._request;
    }

    private readonly _response: http.ServerResponse;
    public get response(): http.ServerResponse
    {
        return this._response;
    }

    private readonly _host: WebHost;
    public get host(): WebHost
    {
        return this._host;
    }

    public constructor(host: WebHost, request: http.IncomingMessage, response: http.ServerResponse)
    {
        this._host     = host;
        this._request  = request;
        this._response = response;
    }
}