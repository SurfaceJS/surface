import { PathTree }      from '@surface/router/path-tree';

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
}