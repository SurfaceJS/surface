import { Reflection } from './index';

declare global
{
    // tslint:disable-next-line:interface-name
    interface Object
    {
        reflect<T>(this: T): Reflection<T>;
    }
}

Object.prototype.reflect = function <T>(this: T)
{
    return Reflection.of(this);
};