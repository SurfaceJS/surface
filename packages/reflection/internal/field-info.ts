import MemberInfo from "./member-info.js";
import type Type  from "./type.js";

export default class FieldInfo extends MemberInfo
{
    public get readonly(): boolean
    {
        return !(this.descriptor.writable ?? true);
    }

    public constructor(key: string | symbol, descriptor: PropertyDescriptor, declaringType: Type, isOwn: boolean, isStatic: boolean)
    {
        super(key, descriptor, declaringType, isOwn, isStatic);
    }
}