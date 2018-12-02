type EntryType = string|Array<string>|Record<string, string|Array<string>>;

export type Entry = EntryType|(() => EntryType|Promise<EntryType>);