import type NamedRoute from "../types/named-route";
import type Route      from "../types/route";

export default interface IRouterInterceptor
{
    intercept(next: (route: string | NamedRoute) => Promise<void>, to: Route, from: Route | undefined): Promise<void>;
}