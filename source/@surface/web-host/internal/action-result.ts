import { Nullable }  from "@surface/core";
import { RouteData } from "@surface/router";
import HttpContext   from "./http-context";

export default abstract class ActionResult
{
    private readonly _httpContext: HttpContext;
    public get httpContext(): HttpContext
    {
        return this._httpContext;
    }

    private readonly _routeData: Nullable<RouteData>;
    public get routeData(): Nullable<RouteData>
    {
        return this._routeData;
    }

    public constructor(httpContext: HttpContext);
    public constructor(httpContext: HttpContext, routeData: RouteData);
    public constructor(httpContext: HttpContext, routeData?: RouteData)
    {
        this._httpContext = httpContext;
        this._routeData   = routeData;
    }

    public abstract executeResult(): void;
}