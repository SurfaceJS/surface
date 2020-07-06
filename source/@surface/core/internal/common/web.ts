import { Indexer } from "../types";

export function normalizeUrlPath(path: string): string
{
    return (path.startsWith("/") ? "" : "/") + path.replace(/\/$/, "");
}

export function parseQuery(source: string): Indexer<string>
{
    if (!source)
    {
        return { }
    }

    const entries = source.split("&")
        .map
        (
            pair =>
            {
                const [key, value] = pair.split("=");

                return [key, decodeURIComponent(value)] as const;
            }
        );

    return Object.fromEntries(entries);
}

export function parseUrl(source: string): { path: string, hash: string, query: string }
{
    if (source.includes("?"))
    {
        const [path, rest  = ""] = source.split("?")
        const [query, hash = ""] = rest.split("#");

        return { hash, path, query };
    }
    else
    {
        const [path, hash = ""] = source.split("#");

        return { hash, path, query: "" };
    }
}

export function stringfyQuery(query: Indexer<string>): string
{
    return "?" + Object.entries(query).map(([key, value]) => `${key}=${encodeURIComponent(`${value}`)}`).join("&");
}