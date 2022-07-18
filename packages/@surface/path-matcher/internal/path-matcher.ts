
import { resolve, sep }         from "path";
import { ESCAPABLE_CHARACTERS } from "./characters.js";
import Parser, { type Options } from "./parser.js";

const toArray = <T>(value: T | T[]): T[] => Array.isArray(value) ? value : [value];

export type ResolvedPattern =
{
    base:        string,
    fullPattern: string,
    pattern:     string,
};

export type ResolvedAndParsedPattern =
{
    matcher: PathMatcher,
    paths:   string[],
};

export default class PathMatcher
{
    private readonly include: RegExp[] = [];
    private readonly exclude: RegExp[] = [];
    public readonly paths: string[] = [];

    public constructor(patterns: string | string[], options?: Options)
    {
        for (const pattern of toArray(patterns))
        {
            const resolved = options?.base
                ? PathMatcher.resolve(options.base, pattern, options)
                : {
                    ...PathMatcher.split(pattern, options),
                    fullPattern: pattern,
                };

            this.paths.push(resolved.base);

            (pattern.startsWith("!") ? this.exclude : this.include).push(PathMatcher.makeRegex(resolved.fullPattern, options));
        }
    }

    private static internalResolve(base: string, pattern: string, options?: Options): ResolvedPattern
    {
        const tokens:     string[] = [];
        const separators: number[] = [];

        const splitted = PathMatcher.split(pattern, options);
        const negated  = splitted.pattern.startsWith("!");
        const prefix   = negated ? "!" : "";

        const resolved = resolve(base, splitted.base);

        let index = 0;

        for (const char of resolved)
        {
            char == sep
                ? (tokens.push("/"), separators.push(index))
                : tokens.push(ESCAPABLE_CHARACTERS.has(char) ? `\\${char}` : char);

            index++;
        }

        const fullPattern = `${prefix + tokens.join("")}${tokens[tokens.length - 1] == "/" ? "" : "/"}${negated ? splitted.pattern.substring(1) : splitted.pattern}`;

        return {
            fullPattern,
            base:    resolved,
            pattern: splitted.pattern,
        };
    }

    /**
     * Creates a regex object from given pattern
     * @param pattern Pattern to be parsed.
     * @param options Options object.
     */
    public static makeRegex(pattern: string, options?: Options): RegExp
    {
        return new Parser(pattern, options).parse();
    }

    /**
     * Splits base path from the pattern.
     * @param pattern Pattern to be splited.
     */
    public static split(pattern: string, options?: Options): { base: string, pattern: string }
    {
        return new Parser(pattern, options).split();
    }

    /**
     * Escapes the base path and resolve relative patterns.
     * @param base Base pattern.
     * @param pattern Pattern to resolve relative to base.
     */
    public static resolve(base: string, pattern: string, options?: Options): ResolvedPattern;
    public static resolve(base: string, pattern: string[], options?: Options): ResolvedPattern[];
    public static resolve(base: string, patterns: string | string[], options?: Options): ResolvedPattern | ResolvedPattern[]
    {
        const resolved = toArray(patterns).map(x => PathMatcher.internalResolve(base, x, options));

        return typeof patterns == "string" ? resolved[0]! : resolved;
    }

    /**
     * Matches giving path.
     * @param path Path to match.
     */
    public isMatch(path: string): boolean
    {
        return this.exclude.every(x => x.test(path)) && this.include.some(x => x.test(path));
    }
}
