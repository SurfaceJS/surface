import { Enumerable } from "@surface/enumerable";
import { List }       from "@surface/collection/list";

declare global
{
    // tslint:disable-next-line:interface-name
    interface NodeList
    {
        /** Casts NodeList into Array<Node> */
        toArray(): Array<Node>;
        /** Cast NodeList into Enumerable<Node> */
        asEnumerable(): Enumerable<Node>;
        /** Cast NodeList into List<Node> */
        toList(): List<Node>;
    }

    // tslint:disable-next-line:interface-name
    interface NamedNodeMap
    {
        asEnumerable(): Enumerable<Attr>;
    }
}

NodeList.prototype.toArray = function <T extends Node>(this: NodeListOf<T>)
{
    return Array.from(this);
};

NodeList.prototype.asEnumerable = function <T extends Node>(this: NodeListOf<T>)
{
    return Array.from(this).asEnumerable();
};

NodeList.prototype.toList = function <T extends Node>(this: NodeListOf<T>)
{
    return Array.from(this).toList();
};

NamedNodeMap.prototype.asEnumerable = function(this: NamedNodeMap)
{
    return Array.from(this).asEnumerable();
};