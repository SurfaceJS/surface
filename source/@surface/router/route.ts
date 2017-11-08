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

    public match(path: string): ObjectLiteral
    {
        const pattern            = /^ *{ *([^}]+) *}|(\*) *$/;
        const optionalPattern    = /^ *{ *([^}]+\?) *} *$/;
        const withDefaultPattern = /^ *{ *([^}=]+)(?:=([^}]+))? *} *|(\*)$/;

        let result: ObjectLiteral<string> = { };
        
        let matchDefaults = (pathTree: PathTree): boolean =>
        {
            if (pathTree.childs.length > 0)
                matchDefaults(pathTree.childs.first());

            let match = withDefaultPattern.exec(pathTree.value);

            if (match)
            {
                result[match[1]] = match[2];
                return true;
            }

            return false;
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
                for (let child of pathTree.childs.where(x => pattern.test(x.value) || optionalPattern.test(x.value)))
                {
                    if (target.childs.length > 0 && child.childs.length > 0)
                        matching = executeMatch(target.childs.first(), child);
                    else if (child.childs.length > 0)
                        matching = matchDefaults(child.childs.first()) || optionalPattern.test(child.childs.first().value);
                    else
                        matching = target.childs.length == 0 && child.childs.length == 0;

                    if (matching)
                    {
                        let match = withDefaultPattern.exec(child.value);
                        if (match)
                            result[match[1] || match[3]] = target.value;

                        return true;
                    }
                }
            }

            return matching;
        }
         
        if (path == '/')
        {
            for (let child of this.pathTree.childs)
                matchDefaults(child);
        }
        else
        {
            executeMatch(PathTree.from([path]).childs.first(), this.pathTree);
        }


        return result;
    }
}