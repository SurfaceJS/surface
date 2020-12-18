import type { RouteData } from "@surface/router";
import type HttpContext   from "./http-context.js";

export default abstract class ActionResult
{
    private readonly _httpContext: HttpContext;
    private readonly _routeData: RouteData | null;

    public get httpContext(): HttpContext
    {
        return this._httpContext;
    }

    public get routeData(): RouteData | null
    {
        return this._routeData;
    }

    public constructor(httpContext: HttpContext);
    public constructor(httpContext: HttpContext, routeData: RouteData);
    public constructor(httpContext: HttpContext, routeData?: RouteData)
    {
        this._httpContext = httpContext;
        this._routeData   = routeData ?? null;
    }

    public abstract executeResult(): void;
}