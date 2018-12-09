import { Action1, Func, Nullable } from "@surface/core";
import FieldInfo                   from "./field-info";
import Type                        from "./type";

export default class PropertyInfo extends FieldInfo
{
    public get getter(): Nullable<Func<unknown>>
    {
        return this.descriptor.get;
    }

    public get readonly(): boolean
    {
        return super.readonly || (!!this.descriptor.get && !this.descriptor.set);
    }

    public get setter(): Nullable<Action1<unknown>>
    {
        return this.descriptor.set;
    }

    public constructor(key: string|symbol, descriptor: PropertyDescriptor, declaringType: Type, isStatic: boolean)
    {
        super(key, descriptor, declaringType, isStatic);
    }
}