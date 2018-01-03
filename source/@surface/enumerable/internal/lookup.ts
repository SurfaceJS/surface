import Enumerable from "..";
import HashEncode from "./hash-encode";
import Group      from "./group";

import Comparer from "../comparer";

import { Nullable, Func1 } from "@surface/types";

export default class Lookup<TSource, TKey, TResult>
{
    private comparer:  Comparer<TKey>;
    private groups:    Array<Group<TSource, TKey>>;
    private lastGroup: Nullable<Group<TSource, TKey>>;

    private _count: number;
    public get count(): number
    {
        return this._count;
    }

    public constructor(source: Iterable<TSource>, keySelector: Func1<TSource, TKey>, elementSelector: Func1<TSource, TResult>, comparer: Comparer<TKey>)
    {
        const initialSize = 7;

        this._count   = 0;
        this.comparer = comparer;
        this.groups   = new Array(initialSize);

        for (const element of source)
        {
            const key  = keySelector(element);
            const hash = HashEncode.getHashCode(key);

            let group = this.getGroup(key, hash);

            if (!group)
            {
                group = this.createGroup(key, hash);
            }

            group.add(element);
        }
    }

    private createGroup(key: TKey, hash: number): Group<TSource, TKey>
    {
        if (this.count == this.groups.length)
        {
            this.resize();
        }

        const index = hash % this.groups.length;

        let group = new Group<TSource, TKey>(hash, key);

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

    private getGroup(key: TKey, hash: number): Nullable<Group<TSource, TKey>>
    {
        for (let group: Nullable<Group<TSource, TKey>> = this.groups[hash % this.groups.length]; !!group; group = group.hashNext)
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
        const buffer  = new Array<Group<TSource, TKey>>(newSize);

        let current = this.lastGroup;

        do
        {
            if (current && current.next)
            {
                current = current.next;

                const index = current.hash % newSize;

                current.hashNext = buffer[index];

                buffer[index] = current;
            }
        }
        while (current != this.lastGroup);

        this.groups = buffer;
    }

    public get(key: TKey): Enumerable<TSource>
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