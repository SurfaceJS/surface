import type HttpContext from "../http-context.js";

export default interface IStartup
{
    onStart?(): void;
    onBeginRequest?(httpContext: HttpContext): void;
    onEndRequest?(httpContext: HttpContext): void;
    onError?(error: Error, httpContext: HttpContext): void;
}