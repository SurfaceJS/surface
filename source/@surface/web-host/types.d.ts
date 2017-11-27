import { HttpContext } from "./http-context";

export interface IStartup
{
    onStart?(): void;
    onBeginRequest?(httpContext: HttpContext): void;
    onEndRequest?(httpContext: HttpContext): void;
    onError?(error: Error, httpContext: HttpContext): void;
}

export type HttpVerbs = 'POST'|'GET'|'PUT'|'DELETE';