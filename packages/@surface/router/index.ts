import Router from "./internal/router.js";

export type { default as IConstraint }  from "./internal/interfaces/constraint";
export type { default as ITransformer } from "./internal/interfaces/transformer";
export type { default as RouteData }    from "./internal/types/route-data";
export type { default as RouterMatch }  from "./internal/types/router-match";
export type { default as RouteOptions } from "./internal/types/route-options";

export default Router;