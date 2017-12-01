import '@surface/enumerable/extensions';
import { Enumerable }              from '@surface/enumerable';
import { Nullable, ObjectLiteral } from '@surface/types';

export class Dictionary<TKey = string, TValue = Object> extends Enumerable<KeyValuePair<TKey, TValue>>
{
    private _source: Map<TKey, Nullable<TValue>>;
    
    public [Symbol.iterator]: () => Iterator<KeyValuePair<TKey, TValue>>;

    public get size(): number
    {
        return this._source.size;
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

        this._source = new Map();
        keysValues.forEach(x => this._source.set(x.key, x.value));

        this[Symbol.iterator] = function* getIterable(this: Dictionary<TKey, TValue>)
        {
            for (const element of this._source)
            {
                let [ key, value ] = element;
                yield new KeyValuePair(key, value);
            }
        }
        .bind(this);
    }

    public delete(key: TKey): void
    {
        this._source.delete(key);
    }

    public has(key: TKey): boolean
    {
        return this._source.has(key);
    }

    public get(key: TKey): Nullable<TValue>
    {
        return this._source.get(key);
    }

    public set(key: TKey, value: TValue): void
    {
        this._source.set(key, value);
    }
}

export class KeyValuePair<TKey, TValue>
{
    private _key: TKey;
    public get key(): TKey
    {
        return this._key;
    }
    
    public set key(value: TKey)
    {
        this._key = value;
    }

    private _value: TValue;
    public get value(): TValue
    {
        return this._value;
    }
    
    public set value(value: TValue)
    {
        this._value = value;
    }

    public constructor();
    public constructor(key: TKey, value: TValue);
    public constructor(key?: TKey, value?: TValue)
    {
        if (key)
        {
            this._key = key;
        }
        
        if (value)
        {
            this._value = value;
        }
    }
}