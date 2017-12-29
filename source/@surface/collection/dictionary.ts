import "@surface/enumerable/extensions";

import { Enumerable }              from "@surface/enumerable";
import { Nullable, ObjectLiteral } from "@surface/types";

export class Dictionary<TKey = string, TValue = Object> extends Enumerable<KeyValuePair<TKey, TValue>>
{
    private source: Map<TKey, TValue>;

    public [Symbol.iterator]: () => Iterator<KeyValuePair<TKey, TValue>>;

    public get size(): number
    {
        return this.source.size;
    }

    public constructor();
    public constructor(source:  ObjectLiteral<TValue>);
    public constructor(source:  Array<KeyValuePair<TKey, TValue>>);
    public constructor(source?: ObjectLiteral<TValue>|Array<KeyValuePair<TKey, TValue>>)
    {
        super();

        let keysValues: Array<KeyValuePair<TKey, TValue>> = [];

        if (source)
        {
            if (Array.isArray(source))
            {
                keysValues = source;
            }
            else
            {
                keysValues = Object.keys(source).asEnumerable().select(x => new KeyValuePair(x as Object as TKey, source[x])).toArray();
            }
        }

        this.source = new Map();
        keysValues.forEach(x => this.source.set(x.key, x.value));

        this[Symbol.iterator] = function* getIterable(this: Dictionary<TKey, TValue>)
        {
            for (const element of this.source)
            {
                let [ key, value ] = element;
                yield new KeyValuePair(key, value);
            }
        }
        .bind(this);
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