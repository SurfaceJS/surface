import { readFile } from "fs/promises";
import { join }     from "path";
import { isFile }   from "@surface/rwx";
import type pacote  from "pacote";

const ENV_PATTERN     = /\$\{([A-Z][A-Z0-9_]+)\}/gi;
const COMMENT_PATTERN = /^\s*[#;]/i;

type Env = NodeJS.ProcessEnv | Record<string, string>;

function parse(source: string, env: Env): Record<string, unknown>
{
    const entries: Record<string, unknown> = { };

    for (const line of source.split("\n"))
    {
        if (!COMMENT_PATTERN.test(line))
        {
            const index = line.indexOf("=");

            if (index > 0)
            {
                const key   = sanitize(line.substring(0, index));
                const value = parseValue(line.substring(index + 1), env);

                entries[key] = value;
            }
        }
    }

    return entries;
}

function parseValue(raw: string, env: Env): unknown
{
    const value = sanitize(raw).replace(ENV_PATTERN, (_, capture) => env[capture as string] ?? "");

    if (value == "")
    {
        return undefined;
    }

    if (value == "true" || value == "false")
    {
        return value == "true";
    }

    const number = Number(value);

    return !Number.isNaN(number) ? number : value;
}

function sanitize(raw: string): string
{
    if (raw.startsWith("\"") && raw.endsWith("\"") || raw.startsWith("'") && raw.endsWith("'"))
    {
        return raw.substring(1, raw.length - 1);
    }

    let value = "";
    let index = 0;

    const commentToken = new Set([";", "#"]);

    while (index < raw.length)
    {
        const char = raw[index]!;
        const next = raw[index + 1];

        if (char == "\\" && next && commentToken.has(next))
        {
            value += next;

            index += 2;
        }
        else
        {
            if (commentToken.has(char))
            {
                break;
            }

            value += char;

            index++;
        }
    }

    return value.trim();
}

export default async function loadConfig(path: string, env: Env): Promise<pacote.Options | null>
{
    const npmrc = join(path, ".npmrc");

    if (await isFile(npmrc))
    {
        return parse((await readFile(npmrc)).toString(), env);
    }

    return null;
}
