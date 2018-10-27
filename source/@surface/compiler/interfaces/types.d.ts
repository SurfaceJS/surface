import { Indexer } from "@surface/core";

type EntryType = string|Array<string>|Indexer<string>|Indexer<Array<string>>;

export type Entry = EntryType|(() => EntryType|Promise<EntryType>);