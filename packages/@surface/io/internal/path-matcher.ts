import { resolve }      from "path";
import parsePatternPath from "./parse-pattern-path.js";

const GLOB_STAR = /^\*\*(\/|\\)?/;

export default class PathMatcher
{
    private readonly include: RegExp;
    private readonly exclude?: RegExp;

    public constructor(patterns: string | RegExp | (string | RegExp)[], cwd: string)
    {
        const $include: RegExp[] = [];
        const $exclude: RegExp[] = [];

        for (const pattern of Array.isArray(patterns) ? patterns : [patterns])
        {
            if (typeof pattern == "string")
            {
                let resolved = pattern;

                let excluded = false;

                if (resolved.startsWith("!"))
                {
                    resolved = resolved.replace(/^\!/, "");

                    excluded = true;
                }

                resolved = GLOB_STAR.test(resolved) ? resolved : resolve(cwd, resolved);

                const regex = parsePatternPath(resolved);

                excluded ? $exclude.push(regex) : $include.push(regex);
            }
            else
            {
                $include.push(pattern);
            }
        }

        this.include = new RegExp($include.map(x => `(${x.source})`).join("|"));

        if ($exclude.length > 0)
        {
            this.exclude = new RegExp($exclude.map(x => `(${x.source})`).join("|"));
        }
    }

    public test(path: string): boolean
    {
        return this.include.test(path) && !this.exclude?.test(path);
    }
}