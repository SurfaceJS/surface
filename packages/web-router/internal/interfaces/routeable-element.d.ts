import type { IDisposable } from "@surface/core";
import type Route           from "../types/route.js";

export default interface IRouteableElement extends HTMLElement, Partial<IDisposable>
{
    onRouteEnter?(to: Route, from?: Route): void;
    onRouteLeave?(to: Route, from?: Route): void;
    onRouteUpdate?(to: Route, from?: Route): void;
    dispose?(): void;
}