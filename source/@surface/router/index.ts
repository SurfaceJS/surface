import "@surface/collection/extensions";

import Route      from "./route";
import IRouteData from "./interfaces/route-data";

import Dictionary            from "@surface/collection/dictionary";
import List                  from "@surface/collection/list";
import Enumerable            from "@surface/enumerable/index";
import { Action1, Nullable } from "@surface/types";

export default class Router
{
    private readonly routeAction: Dictionary<string, Action1<Nullable<IRouteData>>>;
    private readonly routes:      List<Route>;

    public constructor();
    public constructor(routes:  List<Route>);
    public constructor(routes?: List<Route>)
    {
        this.routeAction = new Dictionary();
        this.routes      = routes || new List();
    }

    public mapRoute(name: string, pattern: string, isDefault?: boolean): Router
    {
        this.routes.add(new Route(name, pattern, !!isDefault));
        return this;
    }

    public match(path: string): Nullable<IRouteData>
    {
        let routes = this.routes as Enumerable<Route>;

        if (path == "/")
        {
            routes = routes.where(x => x.isDefault);
        }

        let routeData = this.routes.select(x => x.match(path)).firstOrDefault(x => !!x);

        let action = this.routeAction.get(path) || this.routeAction.get("*");

        if (action)
        {
            action(routeData);
        }

        return routeData;
    }

    public when(route: string, action: Action1<Nullable<IRouteData>>): Router
    {
        this.routeAction[route] = action;
        return this;
    }
}