import HttpContext from "../http-context";

export default interface IStartup
{
    onStart?(): void;
    onBeginRequest?(httpContext: HttpContext): void;
    onEndRequest?(httpContext: HttpContext): void;
    onError?(error: Error, httpContext: HttpContext): void;
}