import { Indexer, Nullable } from "@surface/core";

export default interface IRouteData
{
    match:  string;
    params: Indexer<string>;
    root:   string;
    route:  string;
    search: Nullable<Indexer<string>>;
}