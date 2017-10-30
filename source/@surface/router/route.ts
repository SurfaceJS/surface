import '@surface/enumerable/extensions';

import { LiteralObject } from '@surface/types';

export class Route
{
    private pathValue : string
    public get path(): string
    {
        return this.pathValue;
    }

    private subRoutesValue : Array<Route>
    public get subRoutes(): Array<Route>
    {
        return this.subRoutesValue;
    }

    public get normalized(): Route
    {
        return new Route(this.path, this.subRoutes);
    }

    public constructor();
    public constructor(route?: string, routePaths?: Array<Route>);
    public constructor(route?: string, routePaths?: Array<Route>)
    {
        this.pathValue      = route      || '/';
        this.subRoutesValue = routePaths || [];
    }

    public normalize(): void
    {
        if (this.subRoutes.length == 1)
        {
            this.pathValue      = this.path + '/' + this.subRoutes[0].path;
            this.subRoutesValue = this.subRoutes[0].subRoutes;
        }
        else
        {
            for (let subRoute of this.subRoutes)
            {
                subRoute.normalize();
            }
        }
    }
    
    public static from(source: Array<string>): Route
    {
        let routePaths = source.asEnumerable()
            .select(x => new Route(x.replace(/^\/|\/$/, '')))
            .toArray();

        return Route.resolveRoutePaths(new Route('/', routePaths));
    }

    private static resolveRoutePaths(routePath: Route): Route
    {
        let tmp: LiteralObject<Array<string>> = { };
    
        for (let i = 0; i < routePath.subRoutes.length; i++)
        {
            let segments = routePath.subRoutes[i].path.split('/');
    
            for (let ii = 0; ii < segments.length; ii++)
            {
                let segment = segments[ii];
    
                tmp[segment] = tmp[segment] || [];
    
                if (ii + 1 < segments.length)
                    tmp[segment].push(segments.splice(ii + 1, segments.length).join('/'))
            }
        }
    
        routePath.subRoutesValue = Object.keys(tmp).asEnumerable()
            .select
            (
                key => this.resolveRoutePaths
                (
                    new Route
                    (
                        key,
                        tmp[key].asEnumerable().select(route => new Route(route)).toArray()
                    )
                )
            )
            .toArray();
    
        return routePath;
    }
}