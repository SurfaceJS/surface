import Router from "./internal/router.js";

export type { default as IConstraint }  from "./internal/interfaces/constraint.js";
export type { default as ITransformer } from "./internal/interfaces/transformer.js";
export type { default as RouteData }    from "./internal/types/route-data.js";
export type { default as RouterMatch }  from "./internal/types/router-match.js";
export type { default as RouteOptions } from "./internal/types/route-options.js";

export default Router;