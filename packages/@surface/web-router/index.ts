import WebRouter from "./internal/web-router.js";

export type { default as IMiddleware }        from "./internal/interfaces/middleware";
export type { default as IRouteableElement }  from "./internal/interfaces/routeable-element";
export type { default as Component }          from "./internal/types/component";
export type { default as NamedRoute }         from "./internal/types/named-route";
export type { default as Route }              from "./internal/types/route";
export type { default as RouteConfiguration } from "./internal/types/route-configuration";

export default WebRouter;