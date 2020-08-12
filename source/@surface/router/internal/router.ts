import { Func, Indexer, typeGuard } from "@surface/core";
import ITransformer                 from "./interfaces/transformer";
import Route                        from "./route";
import RouteData                    from "./route-data";
import RouterMatch                  from "./types/router-match";

type Entry<T> =
    {
        route:    Route,
        selector: Func<[RouteData], T>,
    };

const DEFAULT_TRANFORMERS: [string, ITransformer][] =
[
    ["Boolean", { parse: Boolean,                              stringfy: x => x.toString() }],
    ["Date",    { parse: (source: string) => new Date(source), stringfy: (x: Date) => x.toISOString().replace(/T.+$/, "") }],
    ["Number",  { parse: Number,                               stringfy: x => x.toString() }],
];

export default class Router<T = RouteData>
{
    protected readonly entries:     Entry<T>[]                = [];
    protected readonly namedEntries: Map<string, Entry<T>>    = new Map();
    protected readonly tranformers: Map<string, ITransformer> = new Map(DEFAULT_TRANFORMERS);

    public map(pattern: string): this;
    public map(pattern: string, selector: Func<[RouteData], T>): this;
    public map(name: string, pattern: string): this;
    public map(name: string, pattern: string, selector: Func<[RouteData], T>): this;
    public map(...args: [string] | [string, string] | [string, Func<[RouteData], T>] | [string, string, Func<[RouteData], T>]): this
    {
        const [name, pattern, selector = (x: RouteData) => x as unknown as T] =
            args.length == 1
                ? [undefined, args[0], undefined]
                : args.length == 2
                    ? typeGuard<[string, string]>(args, typeof args[1] == "string")
                        ? [...args, undefined]
                        : [undefined, ...args]
                    : args;

        const entry = { route: new Route(pattern, this.tranformers), selector };

        if (name)
        {
            this.namedEntries.set(name, entry);
        }

        this.entries.push(entry);

        return this;
    }

    public match(uri: string): RouterMatch<T>;
    public match(name: string, parameters: Indexer): RouterMatch<T>;
    public match(...args: [string] | [string, Indexer]): RouterMatch<T>
    {
        if (args.length == 1)
        {
            const uri = args[0];

            for (const entry of this.entries)
            {
                const match = entry.route.match(uri);

                if (match.matched)
                {
                    return { matched: true, value: entry.selector(match.routeData) };
                }
            }

            return { matched: false, reason: `No match found to the path: ${uri}` };
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