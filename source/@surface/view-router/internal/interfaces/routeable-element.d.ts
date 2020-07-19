import Route from "../types/route";

export default interface IRouteableElement extends HTMLElement
{
    onEnter?(to: Route, from?: Route): void
    onLeave?(to: Route, from?: Route): void
    onUpdate?(to: Route, from?: Route): void
}