import { Nullable } from "@surface/types";
import IGroup       from "../interfaces/group";

export default class Group<TKey, TElement> implements IGroup<TKey, TElement>
{
    private readonly source: Array<TElement> = [];
    public get elements(): Array<TElement>
    {
        return this.source;
    }

    private readonly _key: TKey;
    public get key(): TKey
    {
        return this._key;
    }

    public get count(): number
    {
        return this.source.length;
    }

    private readonly _hash: number;
    public get hash(): number
    {
        return this._hash;
    }

    private _hashNext: Nullable<Group<TKey, TElement>>;
    public get hashNext(): Nullable<Group<TKey, TElement>>
    {
        return this._hashNext;
    }

    public set hashNext(value: Nullable<Group<TKey, TElement>>)
    {
        this._hashNext = value;
    }

    private _next: Nullable<Group<TKey, TElement>>;
    public get next(): Nullable<Group<TKey, TElement>>
    {
        return this._next;
    }

    public set next(value: Nullable<Group<TKey, TElement>>)
    {
        this._next = value;
    }

    public constructor(hash: number, key: TKey)
    {
        this._hash = hash;
        this._key  = key;
    }

    public add(element: TElement): void
    {
        this.source.push(element);
    }
}