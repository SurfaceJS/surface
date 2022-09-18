import type { Delegate } from "@surface/core";
import type IConstraint  from "../interfaces/constraint.js";
import type ITransformer from "../interfaces/transformer.js";
import type RouteData    from "./route-data.js";

type RouteOptions<T> =
{
    pattern:       string,
    constraints?:  Record<string, IConstraint>,
    name?:         string,
    selector?:     Delegate<[RouteData], T>,
    transformers?: Record<string, ITransformer>,
};

export default RouteOptions;
