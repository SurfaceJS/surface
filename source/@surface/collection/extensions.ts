import { Dictionary, KeyValuePair } from "./dictionary";
import { List }                     from "./list";

import { Enumerable } from "@surface/enumerable";
import { Func1 }      from "@surface/types";

declare global
{
    // tslint:disable-next-line:interface-name
    interface Array<T>
    {
        /** Cast Array<T> into Enumerable<T> */
        asEnumerable(): Enumerable<T>;
        /** Cast Array<T> into List<T> */
        toList(): List<T>;
    }
}

declare module "@surface/enumerable"
{
    // tslint:disable-next-line:interface-name
    interface Enumerable<TSource>
    {
        /** Creates an List from a Enumerable<T>. */
        toList(): List<TSource>;
        /** Creates an Dictionary from a Enumerable<T>. */
        toDictionary<TSource, TKey, TValue>(this: Enumerable<TSource>, keySelector: Func1<TSource, TKey>, valueSelector: Func1<TSource, TValue>): Dictionary<TKey, TValue>;
    }
}

Array.prototype.toList = Array.prototype.toList || function toList<T>(this: Array<T>)
{
    return new List(this);
};

Enumerable.prototype.toList = Enumerable.prototype.toList || function toList<T>(this: Enumerable<T>)
{
    return new List(this);
};

Enumerable.prototype.toDictionary = Enumerable.prototype.toDictionary || function toDictionary<TSource, TKey, TValue>(this: Enumerable<TSource>, keySelector: Func1<TSource, TKey>, valueSelector: Func1<TSource, TValue>): Dictionary<TKey, TValue>
{
    return new Dictionary(this.select(x => new KeyValuePair(keySelector(x), valueSelector(x))).toArray());
};