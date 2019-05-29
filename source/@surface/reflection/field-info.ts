import MemberInfo from "./member-info";
import Type       from "./type";

export default class FieldInfo extends MemberInfo
{
    protected descriptor: PropertyDescriptor;

    public get configurable(): boolean
    {
        return !!this.descriptor.configurable;
    }

    public get enumerable(): boolean
    {
        return !!this.descriptor.enumerable;
    }

    public get readonly(): boolean
    {
        return !(this.descriptor.writable == undefined ? true : this.descriptor.writable);
    }

    public get value(): unknown
    {
        return this.descriptor.value;
    }

    public constructor(key: string|symbol, descriptor: PropertyDescriptor, declaringType: Type, isOwn: boolean, isStatic: boolean)
    {
        super(key, declaringType, isOwn, isStatic);
        this.descriptor = descriptor;
    }
}