import MemberInfo from "./member-info";
import Type       from ".";

import { Nullable } from "@surface/types";

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
        return this.descriptor.writable == false;
    }

    public get value(): Nullable<Object>
    {
        return this.descriptor.value;
    }

    public constructor(key: string, descriptor: PropertyDescriptor, prototype: Object)
    {
        super(key, Type.from(prototype));
        this.descriptor = descriptor;
    }
}