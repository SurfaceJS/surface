import { Enumerable } from "./index";

declare global
{
    // tslint:disable-next-line:interface-name
    interface Array<T>
    {
        /** Cast Array<T> into Enumerable<T> */
        asEnumerable(): Enumerable<T>;
    }
}

Array.prototype.asEnumerable = function asEnumerable<T>(this: Array<T>)
{
    return Enumerable.from(this);
};