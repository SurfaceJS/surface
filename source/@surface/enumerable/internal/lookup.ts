import Enumerable from "..";
import HashEncode from "./hash-encode";
import Group      from "./group";

import { IComparer, ILookup }     from "../types";
import { Func1, Func2, Nullable } from "@surface/types";

export default class Lookup<TSource, TKey, TElement, TResult> implements Iterable<TResult>, ILookup<TKey, TElement>
{
    private comparer:       IComparer<TKey>;
    private groups:         Array<Group<TKey, TElement>>;
    private lastGroup:      Nullable<Group<TKey, TElement>>;
    private resultSelector: Func2<TKey, Enumerable<TElement>, TResult>;

    private _count: number;
    public get count(): number
    {
        return this._count;
    }

    public constructor(source: Iterable<TSource>, keySelector: Func1<TSource, TKey>, elementSelector: Func1<TSource, TElement>, resultSelector: Func2<TKey, Enumerable<TElement>, TResult>, comparer: IComparer<TKey>)
    {
        const initialSize = 7;

        this._count         = 0;
        this.comparer       = comparer;
        this.groups         = new Array(initialSize);
        this.resultSelector = resultSelector;

        for (const element of source)
        {
            const key  = keySelector(element);
            const hash = HashEncode.getHashCode(key);

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

        let group = new Group<TKey, TElement>(hash, key);

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

    private getGroup(key: TKey, hash: number): Nullable<Group<TKey, TElement>>
    {
        for (let group: Nullable<Group<TKey, TElement>> = this.groups[hash % this.groups.length]; !!group; group = group.hashNext)
        {
            if (group.hash == hash && this.comparer.equals(group.key, key))
            {
                return group;
            }
        }

        return;
    }

    private resize(): void
    {
        const two     = 2;
        const newSize = this._count * two + 1;
        const buffer  = new Array<Group<TKey, TElement>>(newSize);

        let current = this.lastGroup;

        do
        {
            if (current = current && current.next)
            {
                const index = current.hash % newSize;

                current.hashNext = buffer[index];

                buffer[index] = current;
            }
        }
        while (current != this.lastGroup);

        this.groups = buffer;
    }

    public *[Symbol.iterator](): Iterator<TResult>
    {
        let current = this.lastGroup;

        do
        {
            if (current = current && current.next)
            {
                yield this.resultSelector(current.key, Enumerable.from(current.elements));
            }
        }
        while(current != this.lastGroup);
    }

    public contains(key: TKey): boolean
    {
        return !!this.getGroup(key, HashEncode.getHashCode(key));
    }

    public get(key: TKey): Enumerable<TElement>
    {
        const group = this.getGroup(key, HashEncode.getHashCode(key));

        if (group)
        {
            return Enumerable.from(group.elements);
        }

        return Enumerable.empty();
    }
}