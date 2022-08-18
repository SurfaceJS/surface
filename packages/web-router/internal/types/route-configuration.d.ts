import type { Indexer }                   from "@surface/core";
import type { IConstraint, ITransformer } from "@surface/router";
import type Component                     from "./component.js";

type ComponentOrFactory = Component | (() => Component);
type RouteConfigurationComponent = { component: ComponentOrFactory };
type RouteConfigurationComponents = { components: Record<string, ComponentOrFactory> };

type RouteConfiguration =
{
    path:          string,
    children?:     RouteConfiguration[],
    meta?:         Indexer,
    name?:         string,
    selector?:     string,
    constraints?:  Record<string, IConstraint>,
    transformers?: Record<string, ITransformer>,
} & (RouteConfigurationComponent | RouteConfigurationComponents);

export default RouteConfiguration;