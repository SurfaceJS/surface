/* eslint-disable @typescript-eslint/indent */
import WebRouter from "./internal/web-router.js";

export type { default as IRouterInterceptor } from "./internal/interfaces/router-interceptor.js";
export type { default as IRouteableElement }  from "./internal/interfaces/routeable-element.js";
export type { default as Component }          from "./internal/types/component.js";
export type { default as NamedRoute }         from "./internal/types/named-route.js";
export type { default as Route }              from "./internal/types/route.js";
export type { default as RouteConfiguration } from "./internal/types/route-configuration.js";

export { default as RouterLinkDirective } from "./internal/router-link-directive.js";

export type
{
    IConstraint  as IRouteParameterIConstraint,
    ITransformer as IRouteParameterTransformer,
} from "@surface/router";

export default WebRouter;