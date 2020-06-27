import { IRouteData } from "..";
import Route          from "./route";

type Callback = (routeData: IRouteData) => void;
type Entry =
    {
        route:     Route,
        callback?: Callback,
    };

const DEFAULT_TRANFORMERS: Array<[string, (source: string) => unknown]> =
[
    ["Boolean", Boolean],
    ["Date",    (source: string) => new Date(source)],
    ["Number",  Number]
];

export default class Router
{
    private readonly entries:     Array<Entry>                             = [];
    private readonly tranformers: Map<string, (source: string) => unknown> = new Map(DEFAULT_TRANFORMERS);

    public map(pattern: string, callback?: Callback): this
    {
        this.entries.push({ route: new Route(pattern, this.tranformers), callback });

        return this;
    }

    public match(uri: string): IRouteData | null
    {
        for (const entry of this.entries.values())
        {
            const routeData = entry.route.match(uri);

            if (routeData)
            {
                entry.callback?.(routeData);

                return routeData;
            }
        }

        return null;
    }
}