type EntryType = string | string[] | Record<string, string | string[]>;

export type Entry = EntryType | (() => EntryType | Promise<EntryType>);