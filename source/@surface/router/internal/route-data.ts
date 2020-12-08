import type { Indexer } from "@surface/core";

export default class RouteData
{
    public constructor(public readonly path: string, public readonly parameters: Indexer = { }, public readonly query: Indexer<string> = { }, public readonly hash: string = "")
    { }

    public toString(): string
    {
        const entries = Object.entries(this.query);

        const query = entries.length > 0
            ? `?${entries.map(([key, value]) => `${key}=${encodeURIComponent(`${value}`)}`).join("&")}`
            : "";

        return this.path + query + (this.hash ? `#${this.hash}` : "");
    }
}