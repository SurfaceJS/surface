import { readFile } from "fs/promises";
import { join }     from "path";
import { isFile }   from "@surface/rwx";

const ENV_PATTERN   = /\$\{([A-Z][A-Z0-9_]+)\}/gi;
const HTTPS_PATTERN = /^https?:/i;
const COMMENT_PATTERN = /^\s*[#;]/i;

type Env = NodeJS.ProcessEnv | Record<string, string>;

export type Auth = { registry?: string, token?: string };

export default class NpmConfig
{
    private readonly scopedAuth: Map<string, Auth | null> = new Map();
    private readonly entries: Map<string, string> = new Map();

    public get registry(): string | undefined
    {
        return this.entries.get("registry");
    }

    public get authToken(): string | undefined
    {
        return this.entries.get("_authToken");
    }

    public constructor(source: string, env: Env)
    {
        for (const line of source.split("\n"))
        {
            if (!COMMENT_PATTERN.test(line))
            {
                const index = line.indexOf("=");

                if (index > 0)
                {
                    const key   = this.sanitize(line.substring(0, index));
                    const value = this.sanitize(line.substring(index + 1)).replace(ENV_PATTERN, (_, capture) => env[capture as string] ?? "");

                    this.entries.set(key, value);
                }
            }
        }
    }

    public static async load(path: string, env: Env): Promise<NpmConfig | null>
    {
        const npmrc = join(path, ".npmrc");

        if (await isFile(npmrc))
        {
            return new NpmConfig((await readFile(npmrc)).toString(), env);
        }

        return null;
    }

    private sanitize(raw: string): string
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

    public getScopedAuth(scope: string): Auth | null
    {
        let auth = this.scopedAuth.get(scope);

        if (auth === undefined)
        {
            const registry = this.entries.get(`${scope}:registry`);
            const token    = registry && this.entries.get(`${registry.replace(HTTPS_PATTERN, "")}:_authToken`);

            this.scopedAuth.set(scope, auth = registry ? { registry, token } : null);
        }

        return auth;
    }
}
