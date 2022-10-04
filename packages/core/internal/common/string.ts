import type { Indexer } from "../types/index.js";

const NO_SLASH_PATTERN_PATTERN = /(^\/)?([^\/]*)(\/$)?/;

export function camelToText(value: string): string
{
    return value.split(/(?:(?<![A-Z])(?=[A-Z]))|(?:(?<![a-zA-Z])(?=[a-z]))|(?:(?<![0-9])(?=[0-9]))/g).join(" ").toLowerCase();
}

export function camelToDashed(value: string): string
{
    return value.split(/(?:(?<![A-Z])(?=[A-Z]))|(?:(?<![a-zA-Z])(?=[a-z]))|(?:(?<![0-9])(?=[0-9]))/g).join("-").toLowerCase();
}

export function capitalize(value: string): string
{
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function capture(source: string, start: RegExp, end: RegExp): [string, string, string]
{
    const startMatch = start.exec(source);
    const startIndex = (startMatch?.index ?? 0) + (startMatch?.[0]?.length ?? 0);

    const endMatch = end.exec(source.substring(startIndex, source.length));
    const endIndex = startIndex + (endMatch?.index ?? 0);

    return [source.substring(0, startIndex), source.substring(startIndex, endIndex), source.substring(endIndex, source.length)];
}

export function captureAll(source: string, start: RegExp, end: RegExp): [string, string, string][]
{
    let captures = ["", "", ""];
    let content  = source;

    const result: [string, string, string][] = [];

    while ((captures = capture(content, start, end))[2])
    {
        if (!captures[0] && !captures[1])
        {
            const tail       = result[result.length - 1]!;
            const endCapture = tail[2];

            tail[2] = `${endCapture}${captures[2]}`;

            break;
        }

        content = captures[2];

        const endMatch = end.exec(content);

        const endCapture = content.substring(0, endMatch?.[0]!.length ?? 0);

        content = content.substring(endMatch?.[0]!.length ?? 0, content.length);

        end.lastIndex = 0;

        result.push([captures[0]!, captures[1]!, endCapture]);
    }

    return result;
}

export function dashedToCamel(value: string): string
{
    return value.replace(/-([a-z])/g, (_, group) => group.toUpperCase());
}

export function dashedToTitle(value: string): string
{
    return value.replace(/(^[a-z]|-[a-z])/g, (_, group) => group.replace(/-/g, "").toUpperCase());
}

export function format(pattern: string, source: Indexer): string
{
    return pattern.replace(/\$\{([^}]*)\}/g, (_, key) => `${source[key]}`);
}

export function joinPaths(...paths: string[]): string
{
    return paths
        .filter(x => !!x)
        .map(x => x.replace(NO_SLASH_PATTERN_PATTERN, "$2"))
        .join("/");
}

export function queryfy(source: object): string
{
    return Array.from(enumeratePropertyPath(source))
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join("&");
}

export function toTitle(value: string): string
{
    return value.replace(/(^[a-z]|\s+[a-z])/g, (_, group) => group.toUpperCase());
}

export function *enumeratePropertyPath(source: object): Iterable<[string, unknown]>
{
    const sourceIsArray = Array.isArray(source);

    for (const [key, value] of Object.entries(source))
    {
        const property = sourceIsArray ? `[${key}]` : key;

        if (value instanceof Object)
        {
            const valueIsArray = Array.isArray(value);

            for (const [nestedKey, nestedValue] of enumeratePropertyPath(value))
            {
                const nestedProperty = valueIsArray ? `${property}${nestedKey}` : `${property}.${nestedKey}`;

                yield [nestedProperty, nestedValue];
            }
        }
        else if (!Object.is(value, undefined))
        {
            yield [property, value];
        }
    }
}
