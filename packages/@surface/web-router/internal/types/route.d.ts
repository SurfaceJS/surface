import type { Indexer } from "@surface/core";

type Route =
{
    meta:       Indexer,
    name:       string,
    parameters: Indexer,
    url:        URL,
};

export default Route;