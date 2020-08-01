import { Indexer } from "@surface/core";
import Component   from "./component";

type ComponentOrFactory = Component | (() => Component)
type RouteConfigurationComponent = { component: ComponentOrFactory };
type RouteConfigurationComponents = { components: Record<string, ComponentOrFactory> }

type RouteConfiguration =
    {
        path:      string;
        children?: Array<RouteConfiguration>;
        meta?:     Indexer;
        name?:     string;
    } & (RouteConfigurationComponent | RouteConfigurationComponents);

export default RouteConfiguration;