import { mymeType } from './variables';
import * as fs      from 'fs';
import * as http    from 'http';
import * as path    from 'path';

export type RoutePath = { route: string, routePaths: RoutePath[] };

export function loadFile(response: http.ServerResponse, filepath: string): void
{
    try
    {
        let extension = path.extname(filepath);
        let data      = fs.readFileSync(filepath);

        response.writeHead(200, { "Content-Type": mymeType[extension] });
        response.write(data);
        response.end();
    }
    catch (error)
    {
        throw error;
    }
}

export function resolveFallback(filepath: string): string
{    
    filepath = filepath.replace(/^\//, "") || '';
    
    let targets =
    [
        filepath,
        filepath + '.html',
        filepath + '.htm',
        path.join(filepath, 'index.html'),
        path.join(filepath, 'index.htm'),
        path.join(filepath, 'default.html'),
        path.join(filepath, 'default.htm')
    ];

    try
    {
        return targets.asEnumerable().first(x => fs.existsSync(x) && fs.lstatSync(x).isFile());        
    }
    catch (error)
    {
        throw new Error('The provided fallback path is invalid.');
    }
}