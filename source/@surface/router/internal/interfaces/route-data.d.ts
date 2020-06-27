import { Indexer } from "@surface/core";

export default interface IRouteData
{
    hash:   string;
    params: Indexer;
    path:   string;
    query:  Indexer<string>;
}