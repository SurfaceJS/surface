import type { Delegate } from "@surface/core";
import type IConstraint  from "../interfaces/constraint";
import type ITransformer from "../interfaces/transformer";
import type RouteData    from "./route-data";

type RouteOptions<T> =
{
    pattern:       string,
    constraints?:  Record<string, IConstraint>,
    name?:         string,
    selector?:     Delegate<[RouteData], T>,
    transformers?: Record<string, ITransformer>,
};

export default RouteOptions;
