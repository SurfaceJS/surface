import type { IDisposable } from "@surface/core";
import type Route           from "../types/route";

export default interface IRouteableElement extends HTMLElement, Partial<IDisposable>
{
    onEnter?(to: Route, from?: Route): void;
    onLeave?(to: Route, from?: Route): void;
    onUpdate?(to: Route, from?: Route): void;
    dispose?(): void;
}