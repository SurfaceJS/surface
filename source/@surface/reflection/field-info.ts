import { Nullable } from "@surface/types";
import MemberInfo   from "./member-info";
import Type         from "./type";

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
        return !!this.descriptor.writable;
    }

    public get value(): Nullable<Object>
    {
        return this.descriptor.value;
    }

    public constructor(key: string, descriptor: PropertyDescriptor, declaringType: Type, isStatic: boolean)
    {
        super(key, declaringType, isStatic);
        this.descriptor = descriptor;
    }
}