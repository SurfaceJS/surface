import { Indexer } from "../types";

export default interface IPackage
{
    dependencies:    Indexer<string>;
    devDependencies: Indexer<string>;
    name:            string;
    path:            string;
    version:         string;
}