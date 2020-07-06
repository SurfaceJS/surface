import { Func }   from "@surface/core";
import IRouteData from "./interfaces/route-data";
import Route      from "./route";

type Entry<T> =
    {
        route:    Route,
        selector: Func<[IRouteData], T>,
    };

const DEFAULT_TRANFORMERS: Array<[string, Func<[string], unknown>]> =
[
    ["Boolean", Boolean],
    ["Date",    (source: string) => new Date(source)],
    ["Number",  Number]
];

export default class Router<T = IRouteData>
{
    protected readonly entries:     Array<Entry<T>>                      = [];
    protected readonly tranformers: Map<string, Func<[string], unknown>> = new Map(DEFAULT_TRANFORMERS);

    public map(pattern: string, selector: Func<[IRouteData], T> = x => (x as unknown as T)): this
    {
        this.entries.push({ route: new Route(pattern, this.tranformers), selector });

        return this;
    }

    public match(uri: string): T | null
    {
        for (const entry of this.entries)
        {
            const routeData = entry.route.match(uri);

            if (routeData)
            {
                return entry.selector(routeData);
            }
        }

        return null;
    }
}