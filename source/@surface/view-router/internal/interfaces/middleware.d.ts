import type Location from "../types/named-route";
import type Route    from "../types/route";

export default interface IMiddleware
{
    onEnter?(to: Route, from: Route | undefined, next: (route: string | Location) => void): void;
}