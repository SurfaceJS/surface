import { Enumerable } from './index';

declare global
{
    interface Array<T>
    {        
        /** Cast Array<T> into Enumerable<T> */
        asEnumerable(): Enumerable<T>;        
    }
}

Array.prototype.asEnumerable = function <T>(this: Array<T>)
{
    return Enumerable.from(this);
}