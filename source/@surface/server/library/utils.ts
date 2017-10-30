import * as serverVariables from './server-variables';
import { Nullable }         from '@surface/types'
import * as fs              from 'fs';
import * as http            from 'http';
import * as path            from 'path';

export type RoutePath = { route: string, routePaths: RoutePath[] };

export function loadFile(response: http.ServerResponse, filepath: string): void
{
    try
    {
        let extension = path.extname(filepath);
        let data      = fs.readFileSync(filepath);

        response.writeHead(200, { "Content-Type": serverVariables.mymeType[extension] });
        response.write(data);
        response.end();
    }
    catch (error)
    {
        throw error;
    }
}

export function resolveUrl(root: string, url: string, defaultRoute: string): Nullable<string>
{
    url          = url.replace(/^\//, "")          || '';
    defaultRoute = defaultRoute.replace(/^\//, "") || '';
    
    let targets =
    [
        path.resolve(root, url),
        path.resolve(root, url, 'index.html'),
        path.resolve(root, url, 'index.htm'),
        path.resolve(root, url, 'default.html'),
        path.resolve(root, url, 'default.htm'),
        path.resolve(root, url + '.html'),
        path.resolve(root, url + '.htm'),
        path.resolve(root, defaultRoute),
        path.resolve(root, defaultRoute, 'index.html'),
        path.resolve(root, defaultRoute, 'index.htm'),
        path.resolve(root, defaultRoute, 'default.html'),
        path.resolve(root, defaultRoute, 'default.htm'),
        path.resolve(root, defaultRoute + '.html'),
        path.resolve(root, defaultRoute + '.htm'),
    ];

    return targets.filter(x => fs.existsSync(x) && fs.lstatSync(x).isFile())[0];
}

export function resolveRoutePaths(routePath: RoutePath): RoutePath
{
    let tmp: { [key: string]: string[] } = { };

    for (let i = 0; i < routePath.routePaths.length; i++)
    {
        let segments = routePath.routePaths[i].route.split('/');

        for (let ii = 0; ii < segments.length; ii++)
        {
            let segment = segments[ii];

            tmp[segment] = tmp[segment] || [];

            if (ii + 1 < segments.length)
                tmp[segment].push(segments.splice(ii + 1, segments.length).join('/'))
        }
    }

    routePath.routePaths = Object.keys(tmp)
        .map
        (
            x => resolveRoutePaths
            (
                {
                    route: x,
                    routePaths: tmp[x].map(y => ({ route: y, routePaths: [] }) as RoutePath)
                } as RoutePath
            )
        );

    return routePath;
}

export function normalize(routePath: RoutePath): void
{
    if (routePath.routePaths.length == 1)
    {
        routePath.route      = routePath.route + '/' + routePath.routePaths[0].route;
        routePath.routePaths = routePath.routePaths[0].routePaths;
    }
    else
    {
        for (let subpath of routePath.routePaths)
        {
            normalize(subpath);
        }
    }
}