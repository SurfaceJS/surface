import type { Indexer }   from "@surface/core";

type Route =
{
    url:        URL,
    parameters: Indexer,
    meta:       Indexer,
    name?:      string,
};

export default Route;