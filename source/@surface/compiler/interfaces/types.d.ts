import { ObjectLiteral } from "@surface/core";

type EntryType = string|Array<string>|ObjectLiteral<string>|ObjectLiteral<Array<string>>;

export type Entry = EntryType|(() => EntryType|Promise<EntryType>);