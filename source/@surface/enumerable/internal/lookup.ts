import { Delegate, Hashcode } from "@surface/core";
import Group                  from "./group";
import IComparer              from "./interfaces/comparer";
import ILookup                from "./interfaces/lookup";

export default class Lookup<TSource, TKey, TElement> implements ILookup<TKey, TElement>
{
    private readonly comparer: IComparer<TKey>;

    private groups:    Group<TKey, TElement>[];
    private lastGroup?: Group<TKey, TElement>;

    private _count: number;

    public get count(): number
    {
        return this._count;
    }

    public constructor(source: Iterable<TSource>, keySelector: Delegate<[TSource], TKey>, elementSelector: Delegate<[TSource], TElement>, comparer: IComparer<TKey>)
    {
        const initialSize = 7;

        this._count         = 0;
        this.comparer       = comparer;
        this.groups         = new Array(initialSize);

        for (const element of source)
        {
            const key  = keySelector(element);
            const hash = Hashcode.encode(key);

            let group = this.getGroup(key, hash);

            if (!group)
            {
                group = this.createGroup(key, hash);
            }

            group.add(elementSelector(element) as Object as TElement);
        }
    }

    private createGroup(key: TKey, hash: number): Group<TKey, TElement>
    {
        if (this.count == this.groups.length)
        {
            this.resize();
        }

        const index = hash % this.groups.length;

        const group = new Group<TKey, TElement>(hash, key);

        group.hashNext = this.groups[index];
        this.groups[index] = group;

        if (!this.lastGroup)
        {
            group.next = group;
        }
        else
        {
            group.next = this.lastGroup.next;

            this.lastGroup.next = group;
        }

        this.lastGroup = group;

        this._count++;
        return group;
    }

    private getGroup(key: TKey, hash: number): Group<TKey, TElement> | null
    {
        for (let group: Group<TKey, TElement> | undefined = this.groups[hash % this.groups.length]; !!group; group = group.hashNext)
        {
            if (group.hash == hash && this.comparer.equals(group.key, key))
            {
                return group;
            }
        }

        return null;
    }

    private resize(): void
    {
        const two     = 2;
        const newSize = this._count * two + 1;
        const buffer  = new Array<Group<TKey, TElement>>(newSize);

        let current = this.lastGroup!;

        do
        {
            current = current.next!;

            const index = current.hash % newSize;

            current.hashNext = buffer[index];

            buffer[index] = current;
        }
        while (current != this.lastGroup);

        this.groups = buffer;
    }

    public *[Symbol.iterator](): Iterator<Group<TKey, TElement>>
    {
        let current = this.lastGroup!;

        do
        {
            current = current.next!;

            yield current;
        }
        while (current != this.lastGroup);
    }

    public contains(key: TKey): boolean
    {
        return !!this.getGroup(key, Hashcode.encode(key));
    }

    public get(key: TKey): TElement[]
    {
        const group = this.getGroup(key, Hashcode.encode(key));

        if (group)
        {
            return group.elements;
        }

        return [];
    }
}
