import type { Indexer }                   from "@surface/core";
import type { IConstraint, ITransformer } from "@surface/router";
import type Component                     from "./component";

type RouteDefinition =
{
    meta:          Indexer,
    path:          string,
    stack:         Map<string, Component | (() => Component)>[],
    name?:         string,
    selector?:     string,
    constraints?:  Record<string, IConstraint>,
    transformers?: Record<string, ITransformer>,
};

export default RouteDefinition;