import Type from "./index";

declare global
{
    // tslint:disable-next-line:interface-name
    interface Object
    {
        getType(this: Object): Type;
    }
}

Object.prototype.getType = function getType(this: Object): Type
{
    return Type.from(this);
};