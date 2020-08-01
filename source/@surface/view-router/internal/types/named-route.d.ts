import { Indexer } from "@surface/core";

type Location =
    {
        name:        string;
        hash?:       string;
        parameters?: Indexer;
        query?:      Indexer<string>;
    };

export default Location;
