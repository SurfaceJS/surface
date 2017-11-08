import '@surface/enumerable/extensions';
import { List }                    from '@surface/enumerable/list';
import { ObjectLiteral, Nullable } from '@surface/types';

export class PathTree
{
    private valueValue: string;
    public get value(): string
    {
        return this.valueValue;
    }
    
    public set value(value: string)
    {
        this.valueValue = value;
    }

    private childsValue: List<PathTree>;
    public get childs(): List<PathTree>
    {
        return this.childsValue;
    }
    
    public set childs(value: List<PathTree>)
    {
        this.childsValue = value;
    }

    private parentValue: Nullable<PathTree>
    public get parent(): Nullable<PathTree>
    {
        return this.parentValue;
    }
    
    public set parent(value: Nullable<PathTree>)
    {
        this.parentValue = value;
    }

    public constructor();
    public constructor(value:  string);
    public constructor(value:  string, parent:  Nullable<PathTree>);
    public constructor(value:  string, parent:  Nullable<PathTree>, childs: List<PathTree>);
    public constructor(value?: string, parent?: Nullable<PathTree>, childs?: List<PathTree>)
    {
        this.value  = value  || '/';
        this.parent = parent;
        this.childs = childs || new List<PathTree>();
        this.normalize();
    }

    public static from(source: Array<string>): PathTree;
    public static from(source: List<string>): PathTree;
    public static from(source: Array<string>|List<string>): PathTree
    {
        if (Array.isArray(source))
            source = new List(source);

        return new PathTree('/', null, source.select(x => new PathTree(x.replace(/^\/|\/$/g, ''))).toList());
    }

    private normalize(): void
    {
        let tmp: ObjectLiteral<List<string>> = { };
        
        for (let i = 0; i < this.childs.length; i++)
        {
            let segments = this.childs.item(i).value.split('/');
    
            for (let ii = 0; ii < segments.length; ii++)
            {
                let segment = segments[ii];
    
                tmp[segment] = tmp[segment] || new List<string>();
    
                if (ii + 1 < segments.length)
                    tmp[segment].add(segments.splice(ii + 1, segments.length).join('/'))
            }
        }
    
        this.childs = Object.keys(tmp).asEnumerable()
            .select(key => new PathTree(key, this, tmp[key].select(route => new PathTree(route)).toList()))
            .toList();
    }        
}