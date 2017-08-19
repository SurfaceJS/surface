import { Enumerable } from "@surface/enumerable";
import { List }       from "@surface/enumerable/list";

declare global
{
    interface Array<T>
    {
        /** Flatten multidimensional arrays */
        flatten(this: Array<T>): Array<Object>;
        /** Cast Array<T> into Enumerable<T> */
        asEnumerable(): Enumerable<T>;
        /** Cast Array<T> into List<T> */
        toList(): List<T>;
    }

    interface NodeList
    {
        /** Casts NodeList into Array<Node> */
        toArray(): Array<Node>;
        /** Cast NodeList into Enumerable<Node> */
        asEnumerable(): Enumerable<Node>;
        /** Cast NodeList into List<Node> */
        toList(): List<Node>;
    }

    interface NamedNodeMap
    {
        asEnumerable(): Enumerable<Attr>;
    }
}

Array.prototype.flatten = function<T>(this: Array<T>)
{
    let items: Array<Object> = [];

    for (const item of this)
    {
        if (Array.isArray(item))
            item.flatten().forEach(x => items.push(x))
        else
            items.push(item);
    }

    return items;
}

Array.prototype.asEnumerable = function <T>(this: Array<T>)
{
    return Enumerable.from(this);
}

Array.prototype.toList = function <T>(this: Array<T>)
{
    return new List(this);
}

NodeList.prototype.toArray = function <T extends Node>(this: NodeListOf<T>)
{
    return Array.from(this);
}

NodeList.prototype.asEnumerable = function <T extends Node>(this: NodeListOf<T>)
{
    return Array.from(this).asEnumerable();
}

NodeList.prototype.toList = function <T extends Node>(this: NodeListOf<T>)
{
    return Array.from(this).toList();
}

declare module "@surface/enumerable"
{
    interface Enumerable<TSource>
    {
        /** Casts Enumerable<T> to List<T> */
        toList(): List<TSource>;
    }
}

Enumerable.prototype.toList = function<T>(this: Enumerable<T>)
{
    return new List(this.toArray());
}

NamedNodeMap.prototype.asEnumerable = function(this: NamedNodeMap)
{
    return Array.from(this).asEnumerable();
}