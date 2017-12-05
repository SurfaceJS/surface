import { HttpContext } from "./http-context";
import { Route }       from "@surface/router/route";
import { Nullable }    from "@surface/types";

export abstract class ActionResult
{
    private _httpContext: HttpContext;
    public get httpContext(): HttpContext
    {
        return this._httpContext;
    }

    private _routeData: Nullable<Route.IData>;
    public get routeData(): Nullable<Route.IData>
    {
        return this._routeData;
    }

    public constructor(httpContext: HttpContext);
    public constructor(httpContext: HttpContext, routeData: Route.IData);
    public constructor(httpContext: HttpContext, routeData?: Route.IData)
    {
        this._httpContext = httpContext;
        this._routeData   = routeData;
    }

    public abstract executeResult(): void;
}