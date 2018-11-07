import { MappedIndexer } from "@surface/core";

type EntryType = string|Array<string>|MappedIndexer<string, string|Array<string>>;

export type Entry = EntryType|(() => EntryType|Promise<EntryType>);