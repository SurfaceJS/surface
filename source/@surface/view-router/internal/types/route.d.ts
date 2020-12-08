import type { Indexer }   from "@surface/core";
import type { RouteData } from "@surface/router";

type Route =
{
    fullPath: string,
    meta:     Indexer,
    path:     string,
    name?:    string,
} & RouteData;

export default Route;