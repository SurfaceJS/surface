import type NamedRoute from "../types/named-route";
import type Route    from "../types/route";

export default interface IMiddleware
{
    onEnter?(to: Route, from: Route | undefined, next: (route: string | NamedRoute) => void): void;
}