import { Enumerable } from '@surface/enumerable';
import { List }       from '@surface/enumerable/list';

declare global
{
    interface Array<T>
    {
        /** Cast Array<T> into Enumerable<T> */
        asEnumerable(): Enumerable<T>;
        /** Cast Array<T> into List<T> */
        toList(): List<T>;
    }
}

Array.prototype.asEnumerable = function <T>(this: Array<T>)
{
    return Enumerable.from(this);
}

Array.prototype.toList = function <T>(this: Array<T>)
{
    return new List(this);
}

declare module '@surface/enumerable'
{
    interface Enumerable<TSource>
    {
        /** Creates an List from a Enumerable<T>. */
        toList(): List<TSource>;
    }
}

Enumerable.prototype.toList = function<T>(this: Enumerable<T>)
{
    return new List(this);
}