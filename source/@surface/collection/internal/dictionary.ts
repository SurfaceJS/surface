import Enumerable   from "@surface/enumerable";
import KeyValuePair from "./key-value-pair.js";

const SOURCE = Symbol("dictionary:source");

export default class Dictionary<TKey, TValue> extends Enumerable<KeyValuePair<TKey, TValue>>
{
    private [SOURCE]: Map<TKey, TValue>;

    public get size(): number
    {
        return this[SOURCE].size;
    }

    public constructor(elements?: Iterable<KeyValuePair<TKey, TValue>>)
    {
        super();
        this[SOURCE] = new Map<TKey, TValue>();

        if (elements)
        {
            for (const element of elements)
            {
                this[SOURCE].set(element.key, element.value);
            }
        }
    }

    public static of<TSouce extends Record<TKey, TSouce[TKey]>, TKey extends keyof TSouce>(source: TSouce): Dictionary<TKey, TSouce[TKey]>
    {
        return new Dictionary(Enumerable.from(Object.keys(source) as TKey[]).select(x => new KeyValuePair(x, source[x])));
    }

    public *[Symbol.iterator](): Iterator<KeyValuePair<TKey, TValue>>
    {
        for (const element of this[SOURCE])
        {
            const [key, value] = element;
            yield new KeyValuePair(key, value);
        }
    }

    public delete(key: TKey): void
    {
        this[SOURCE].delete(key);
    }

    public has(key: TKey): boolean
    {
        return this[SOURCE].has(key);
    }

    public get(key: TKey): TValue | undefined
    {
        return this[SOURCE].get(key);
    }

    public set(key: TKey, value: TValue): void
    {
        this[SOURCE].set(key, value);
    }
}

