import type NamedRoute from "../types/named-route";
import type Route    from "../types/route";

export default interface IMiddleware
{
    execute(to: Route, from: Route | undefined, next: (route: string | NamedRoute) => void): void;
}