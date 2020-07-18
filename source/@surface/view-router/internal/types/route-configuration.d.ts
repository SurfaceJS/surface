import { Indexer } from "@surface/core";
import Component   from "./component";

type RouteConfiguration =
    {
        path:      string;
        children?: Array<RouteConfiguration>;
        meta?:     Indexer;
        name?:     string;
    } & ({ component: Component | (() => Component); } | { components: Record<string, Component | (() => Component)>; });

export default RouteConfiguration;
