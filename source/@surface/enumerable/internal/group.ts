import { Nullable } from "@surface/types";

export default class Group<TElement, TKey>
{
    private readonly _elements: Array<TElement> = [];
    public get elements(): Array<TElement>
    {
        return this._elements;
    }

    private readonly _key: TKey;
    public get key(): TKey
    {
        return this._key;
    }

    public get count(): number
    {
        return this._elements.length;
    }

    private _hash: number;
    public get hash(): number
    {
        return this._hash;
    }

    public set hash(value: number)
    {
        this._hash = value;
    }

    private _hashNext: Nullable<Group<TElement, TKey>>;
    public get hashNext(): Nullable<Group<TElement, TKey>>
    {
        return this._hashNext;
    }

    public set hashNext(value: Nullable<Group<TElement, TKey>>)
    {
        this._hashNext = value;
    }

    private _next: Nullable<Group<TElement, TKey>>;
    public get next(): Nullable<Group<TElement, TKey>>
    {
        return this._next;
    }

    public set next(value: Nullable<Group<TElement, TKey>>)
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
        this.elements.push(element);
    }
}