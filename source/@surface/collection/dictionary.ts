import "@surface/enumerable/extensions";

import { Enumerable }              from "@surface/enumerable";
import { Nullable, ObjectLiteral } from "@surface/types";

export class Dictionary<TKey = string, TValue = Object> extends Enumerable<KeyValuePair<TKey, TValue>>
{
    private source: Map<TKey, TValue>;

    public get size(): number
    {
        return this.source.size;
    }

    public constructor();
    public constructor(source: Iterable<KeyValuePair<TKey, TValue>>);
    public constructor(source?: Iterable<KeyValuePair<TKey, TValue>>)
    {
        super();
        this.source = new Map();

        if (source)
        {
            for (const element of source)
            {
                this.source.set(element.key, element.value);
            }
        }
    }

    public static of<TValue>(source: ObjectLiteral<TValue>): Dictionary<string, TValue>
    {
        return new Dictionary(Object.keys(source).asEnumerable().select(x => new KeyValuePair(x, source[x])).toArray());
    }

    public *[Symbol.iterator](): Iterator<KeyValuePair<TKey, TValue>>
    {
        for (const element of this.source)
        {
            let [ key, value ] = element;
            yield new KeyValuePair(key, value);
        }
    }

    public delete(key: TKey): void
    {
        this.source.delete(key);
    }

    public has(key: TKey): boolean
    {
        return this.source.has(key);
    }

    public get(key: TKey): Nullable<TValue>
    {
        return this.source.get(key);
    }

    public set(key: TKey, value: TValue): void
    {
        this.source.set(key, value);
    }
}

export class KeyValuePair<TKey = string, TValue = Object>
{
    private readonly _key: TKey;
    public get key(): TKey
    {
        return this._key;
    }

    private readonly _value: TValue;
    public get value(): TValue
    {
        return this._value;
    }

    public constructor(key: TKey, value: TValue)
    {
        this._key   = key;
        this._value = value;
    }
}