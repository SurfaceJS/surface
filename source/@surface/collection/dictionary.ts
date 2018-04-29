import { Nullable, ObjectLiteral } from "@surface/core";
import Enumerable                  from "@surface/enumerable";
import KeyValuePair                from "./key-value-pair";

const source = Symbol("dictionary:source");

export default class Dictionary<TKey, TValue> extends Enumerable<KeyValuePair<TKey, TValue>>
{
    private [source]: Map<TKey, TValue>;

    public get size(): number
    {
        return this[source].size;
    }

    public constructor();
    public constructor(elements: Iterable<KeyValuePair<TKey, TValue>>);
    public constructor(elements?: Iterable<KeyValuePair<TKey, TValue>>)
    {
        super();
        this[source] = new Map();

        if (elements)
        {
            for (const element of elements)
            {
                this[source].set(element.key, element.value);
            }
        }
    }

    public static of<TValue>(source: ObjectLiteral<TValue>): Dictionary<string, TValue>
    {
        return new Dictionary(Enumerable.from(Object.keys(source)).select(x => new KeyValuePair(x, source[x])).toArray());
    }

    public *[Symbol.iterator](): Iterator<KeyValuePair<TKey, TValue>>
    {
        for (const element of this[source])
        {
            let [ key, value ] = element;
            yield new KeyValuePair(key, value);
        }
    }

    public delete(key: TKey): void
    {
        this[source].delete(key);
    }

    public has(key: TKey): boolean
    {
        return this[source].has(key);
    }

    public get(key: TKey): Nullable<TValue>
    {
        return this[source].get(key);
    }

    public set(key: TKey, value: TValue): void
    {
        this[source].set(key, value);
    }
}

