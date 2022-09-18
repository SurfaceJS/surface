import type NamedRoute from "../types/named-route.js";
import type Route      from "../types/route.js";

export default interface IRouterInterceptor
{
    intercept(next: (route: string | NamedRoute) => Promise<void>, to: Route, from: Route | undefined): Promise<void>;
}