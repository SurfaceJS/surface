import { Reflection } from './index';

declare global
{
    interface Object
    {
        reflect<T>(this: T): Reflection<T>
    }
}

Object.prototype.reflect = function <T>(this: T)
{
    return Reflection.of(this);
}