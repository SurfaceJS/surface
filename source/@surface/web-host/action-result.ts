import HttpContext from "./http-context";

import IRouteData   from "@surface/router/interfaces/route-data";
import { Nullable } from "@surface/types";

export default abstract class ActionResult
{
    private readonly _httpContext: HttpContext;
    public get httpContext(): HttpContext
    {
        return this._httpContext;
    }

    private readonly _routeData: Nullable<IRouteData>;
    public get routeData(): Nullable<IRouteData>
    {
        return this._routeData;
    }

    public constructor(httpContext: HttpContext);
    public constructor(httpContext: HttpContext, routeData: IRouteData);
    public constructor(httpContext: HttpContext, routeData?: IRouteData)
    {
        this._httpContext = httpContext;
        this._routeData   = routeData;
    }

    public abstract executeResult(): void;
}