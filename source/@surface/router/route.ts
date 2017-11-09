import { PathTree }      from '@surface/router/path-tree';
import { ObjectLiteral } from '@surface/types';

export class Route
{
    private _pathTree: PathTree
    public get pathTree(): PathTree
    {
        return this._pathTree;
    }
    
    public set pathTree(value: PathTree)
    {
        this._pathTree = value;
    }

    public constructor();
    public constructor(routes: Array<string>);
    public constructor(pathTree: PathTree);
    public constructor(routesOrPathTree?: Array<string>|PathTree)
    {
        if (routesOrPathTree)
        {
            if (Array.isArray(routesOrPathTree))
                this.pathTree = PathTree.from(routesOrPathTree.toList());
            else if (routesOrPathTree instanceof PathTree)
                this.pathTree = routesOrPathTree;
            else
                throw new TypeError('Invalid argument type.');
        }
    }

    public match(route: string): ObjectLiteral
    {
        const pattern = /^ *{ *([^} =]+\??)(?: *= *([^} =]+))? *}| *(\*) *$/;

        let result: ObjectLiteral<string> = { route };
        
        let matchDefaults = (pathTree: PathTree): boolean =>
        {
            let matching = false;
            
            if (matching = pathTree.childs.length == 0 || pathTree.childs.any(x => matchDefaults(x)))
            {
                if (pathTree.childs.length == 0)
                {
                    let slices: Array<string> = [];

                    let tmp = pathTree;
                    
                    do
                    {
                        slices.push(tmp.value);
                        
                        if (tmp.parent)
                            tmp = tmp.parent;
                    }
                    while (tmp.parent)

                    result['fullpath'] = slices.reverse().join('/');
                }

                let match = pattern.exec(pathTree.value);

                if (match && !match[1].endsWith('?'))
                {
                    result[match[1]] = match[2];
                    return true;
                }
            }

            return false;
        }

        let recurseOptional = (pathTree: PathTree): boolean =>
        {
            if (pathTree.childs.length > 0)
                return pathTree.childs.any(x => recurseOptional(x));

            return pathTree.value == '*';
        }

        let executeMatch = (target: PathTree, pathTree: PathTree): boolean =>
        {
            let matching = false;

            let current = pathTree.childs.firstOrDefault(x => x.value == target.value)
            
            if (current)
            {   
                result['path'] = result['path'] || '/' + target.value + '/';

                matching = executeMatch(target.childs.first(), current);
            }
            else
            {
                for (let path of pathTree.childs.where(x => pattern.test(x.value)))
                {
                    if (target.childs.length > 0 && path.childs.length > 0)
                        matching = executeMatch(target.childs.first(), path);
                    else if (path.childs.length > 0)
                        matching = path.childs.any(x => recurseOptional(x)) || path.childs.any(x => matchDefaults(x));
                    else
                        matching = target.childs.length == 0 && path.childs.length == 0;

                    if (matching)
                    {
                        if (path.childs.length == 0)
                        {
                            let slices: Array<string> = [];

                            let tmp = path;
                            
                            do
                            {
                                slices.push(tmp.value);
                                
                                if (tmp.parent)
                                    tmp = tmp.parent;
                            }
                            while (tmp.parent)

                            result['fullpath'] = slices.reverse().join('/');
                        }

                        let match = pattern.exec(path.value);
                        if (match)
                            result[match[1] || match[3]] = target.value;

                        return true;
                    }
                }
            }

            return matching;
        }
         
        if (route == '/')
        {
            for (let child of this.pathTree.childs)
                matchDefaults(child);
        }
        else
        {
            executeMatch(PathTree.from([route]).childs.first(), this.pathTree);
        }


        return result;
    }
}