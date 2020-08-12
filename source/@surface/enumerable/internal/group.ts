import IGroup from "./interfaces/group";

export default class Group<TKey, TElement> implements IGroup<TKey, TElement>
{
    private readonly _hash:  number;
    private readonly _key:   TKey;
    private readonly source: TElement[] = [];

    private _next?: Group<TKey, TElement>;
    private _hashNext?: Group<TKey, TElement>;

    public get elements(): TElement[]
    {
        return this.source;
    }

    public get key(): TKey
    {
        return this._key;
    }

    public get count(): number
    {
        return this.source.length;
    }

    public get hash(): number
    {
        return this._hash;
    }

    public get hashNext(): Group<TKey, TElement> | undefined
    {
        return this._hashNext;
    }

    public set hashNext(value: Group<TKey, TElement> | undefined)
    {
        this._hashNext = value;
    }

    public get next(): Group<TKey, TElement> | undefined
    {
        return this._next;
    }

    public set next(value: Group<TKey, TElement> | undefined)
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
