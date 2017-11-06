import { PathTree }      from '@surface/router/path-tree';
import { ObjectLiteral } from '@surface/types';

export class Route
{
    private pathTreeValue: PathTree
    public get pathTree(): PathTree
    {
        return this.pathTreeValue;
    }
    
    public set pathTree(value: PathTree)
    {
        this.pathTreeValue = value;
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
        const pattern = /{ *([^}]+) *}/;
        let result: ObjectLiteral = { };
        
        let matchChild = (fragments: Array<string>, pathTree: PathTree) =>
        {
            fragments.asEnumerable()
                .forEach
                (
                    (fragment, index) =>
                    {            
                        let current = pathTree.childs.firstOrDefault(x => x.value == fragment) || pathTree.childs.firstOrDefault(x => pattern.test(x.value));
                        
                        if (current)
                        {
                            let match = pattern.exec(current.value);
                            if (match)
                                result[match[1]] = fragment;
                            else
                                result['path'] = result['path'] || '/' + fragment + '/';

                            matchChild(fragments.splice(index + 1, fragments.length), current);
                        }
                    }
                );
        }

        matchChild(path.replace(/^\/|\/$/g, '').split('/'), this.pathTree);

        return result;
    }
}