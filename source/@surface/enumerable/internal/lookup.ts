import Enumerable from "..";
import HashEncode from "./hash-encode";
import Group      from "./group";

import Comparer from "../comparer";

import { Func1, Func2, Nullable } from "@surface/types";

export default class Lookup<TSource, TKey, TElement, TResult> implements Iterable<TResult>
{
    private comparer:  Comparer<TKey>;
    private groups:    Array<Group<TElement, TKey>>;
    private lastGroup: Nullable<Group<TElement, TKey>>;

    private _count: number;
    public get count(): number
    {
        return this._count;
    }

    public [Symbol.iterator]: () => Iterator<TResult>;

    public constructor(source: Iterable<TSource>, keySelector: Func1<TSource, TKey>, elementSelector: Func1<TSource, TElement>, resultSelector: Func2<TKey, Iterable<TElement>, TResult>, comparer: Comparer<TKey>)
    {
        const initialSize = 7;

        this._count   = 0;
        this.comparer = comparer;
        this.groups   = new Array(initialSize);

        this[Symbol.iterator] = function* ()
        {
            let current = this.lastGroup;

            do
            {
                if (current = current && current.next)
                {
                    yield resultSelector(current.key, current.elements);
                }
            }
            while(current != this.lastGroup);
        };

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

    private createGroup(key: TKey, hash: number): Group<TElement, TKey>
    {
        if (this.count == this.groups.length)
        {
            this.resize();
        }

        const index = hash % this.groups.length;

        let group = new Group<TElement, TKey>(hash, key);

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

    private getGroup(key: TKey, hash: number): Nullable<Group<TElement, TKey>>
    {
        for (let group: Nullable<Group<TElement, TKey>> = this.groups[hash % this.groups.length]; !!group; group = group.hashNext)
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
        const buffer  = new Array<Group<TElement, TKey>>(newSize);

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

    public get(key: TKey): Enumerable<TElement>
    {
        const hash  = HashEncode.getHashCode(key);
        const group = this.getGroup(key, hash);

        if (group)
        {
            return Enumerable.from(group.elements);
        }

        return Enumerable.empty();
    }
}