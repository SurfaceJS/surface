import Location from "../types/named-route";
import Route    from "../types/route";

export default interface IMiddleware
{
    onEnter?(to: Route, from: Route | undefined, next: (route: string | Location) => void): void
}