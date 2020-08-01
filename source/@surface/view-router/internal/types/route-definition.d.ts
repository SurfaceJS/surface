import { Indexer } from "@surface/core";
import Component   from "./component";

type RouteDefinition =
    {
        meta:  Indexer,
        path:  string,
        stack: Array<Map<string, Component | (() => Component)>>
        name?: string,
    }

export default RouteDefinition;