import { Indexer } from "@surface/core";
import Component   from "./component";

type RouteConfiguration =
    {
        path: string;
        args?: Indexer;
        name?: string;
        children?: Array<RouteConfiguration>;
    } & ({ component: Component | (() => Component); } | { components: Record<string, Component | (() => Component)>; });

export default RouteConfiguration;
