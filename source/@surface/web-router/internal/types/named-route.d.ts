import type { Indexer } from "@surface/core";

type NamedRoute =
{
    name:        string,
    hash?:       string,
    parameters?: Indexer,
    query?:      Indexer<string | string[]>,
};

export default NamedRoute;
