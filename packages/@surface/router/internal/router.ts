import type { Delegate, Indexer } from "@surface/core";
import type IConstraint           from "./interfaces/constraint.js";
import type ITransformer          from "./interfaces/transformer";
import Route                      from "./route.js";
import type RouteData             from "./types/route-data.js";
import type RouteOptions          from "./types/route-options";
import type RouterMatch           from "./types/router-match";

type Entry<T> =
{
    route:    Route,
    selector: Delegate<[RouteData], T>,
};

const ALPHA_PATTERN = /^[a-zA-Z]+$/;
const DATE_PATTERN  = /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/;
const UIID_PATTERN  = /^(([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})|([0-9a-f]{32}))$/i;

const DEFAULT_CONSTRAINTS: [string, IConstraint][] =
[
    ["Alpha",   { validate: x => ALPHA_PATTERN.test(x) }],
    ["Boolean", { validate: x => x == "true" || x == "false" }],
    ["Date",    { validate: x => DATE_PATTERN.test(x) }],
    ["Number",  { validate: x => !Number.isNaN(Number(x)) }],
    ["UIID",    { validate: x => UIID_PATTERN.test(x) }],
];

const DEFAULT_TRANFORMERS: [string, ITransformer][] =
[
    ["Boolean", { parse: Boolean,                              stringify: String }],
    ["Date",    { parse: (source: string) => new Date(source), stringify: (x: Date) => x.toISOString().replace(/T.+$/, "") }],
    ["Number",  { parse: Number,                               stringify: String }],
];

export default class Router<T = RouteData>
{
    protected readonly entries:      Entry<T>[]            = [];
    protected readonly namedEntries: Map<string, Entry<T>> = new Map();

    public map(options: RouteOptions<T>): this
    {
        const constraints  = new Map([...DEFAULT_CONSTRAINTS, ...Object.entries(options.constraints ?? { })]);
        const transformers = new Map([...DEFAULT_TRANFORMERS, ...Object.entries(options.transformers ?? { })]);

        const route = new Route(options.pattern, constraints, transformers);

        const entry = { route, selector: options.selector ?? (x => x as unknown as T) };

        if (options.name)
        {
            this.namedEntries.set(options.name, entry);
        }

        this.entries.push(entry);

        return this;
    }

    public match(path: string): RouterMatch<T>;
    public match(name: string, parameters: Indexer): RouterMatch<T>;
    public match(...args: [string] | [string, Indexer]): RouterMatch<T>
    {
        if (args.length == 1)
        {
            const path = args[0];

            if (path.includes("?") || path.includes("#"))
            {
                throw new Error(`"${path}" is not a valid url pathname`);
            }

            for (const entry of this.entries)
            {
                const match = entry.route.match(path);

                if (match.matched)
                {
                    return { matched: true, value: entry.selector(match.routeData) };
                }
            }

            return { matched: false, reason: `No match found to the path: ${path}` };
        }

        const [name, parameters] = args;

        const entry = this.namedEntries.get(name);

        if (entry)
        {
            const match = entry.route.match(parameters);

            if (match.matched)
            {
                return { matched: true, value: entry.selector(match.routeData) };
            }

            return match;
        }

        return { matched: false, reason: `No named route found to: ${name}` };
    }
}