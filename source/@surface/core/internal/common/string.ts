import { Indexer } from "../types";
import { tuple }   from "./generic";

export function camelToText(value: string): string
{
    return value.split(/(?=[A-Z])/g).join(" ").toLowerCase();
}

export function camelToDashed(value: string): string
{
    return value.split(/(?=[A-Z])/g).join("-").toLowerCase();
}

export function capture(source: string, start: RegExp, end: RegExp): [string, string, string]
{
    const startMatch = start.exec(source);
    const startIndex = (startMatch?.index ?? 0) + (startMatch?.[0]?.length ?? 0);

    const endMatch = end.exec(source.substring(startIndex, source.length));
    const endIndex = startIndex + (endMatch?.index ?? 0);

    return [source.substring(0, startIndex), source.substring(startIndex, endIndex), source.substring(endIndex, source.length)];
}

export function captureAll(source: string, start: RegExp, end: RegExp): Array<[string, string, string]>
{
    let captures = tuple("", "", "");
    let content  = source;

    const result: Array<[string, string, string]> = [];

    while ((captures = capture(content, start, end))[2])
    {
        if (!captures[0] && !captures[1])
        {
            const tail       = result[result.length -1];
            const endCapture = tail[2];

            tail[2] = `${endCapture}${captures[2]}`;

            break;
        }

        content = captures[2];

        const endMatch = end.exec(content);

        const endCapture = content.substring(0, endMatch?.[0].length ?? 0);

        content = content.substring(endMatch?.[0].length ?? 0, content.length);

        end.lastIndex = 0;

        result.push([captures[0], captures[1], endCapture]);
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

export function toTitle(value: string): string
{
    return value.replace(/(^[a-z]|\s+[a-z])/g, (_, group) => group.toUpperCase());
}

export function uuidv4()
{
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace
    (
        /[xy]/g,
        character =>
        {
            const random = Math.random() * 16 | 0;
            const value  = character == "x" ? random : (random & 0x3 | 0x8);
            return value.toString(16);
        }
    );
}