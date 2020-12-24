import type { Indexer } from "@surface/core";
import type Component   from "./component";

type ComponentOrFactory = Component | (() => Component);
type RouteConfigurationComponent = { component: ComponentOrFactory };
type RouteConfigurationComponents = { components: Record<string, ComponentOrFactory> };

type RouteConfiguration =
{
    path:      string,
    children?: RouteConfiguration[],
    meta?:     Indexer,
    name?:     string,
    selector?:   string,
} & (RouteConfigurationComponent | RouteConfigurationComponents);

export default RouteConfiguration;