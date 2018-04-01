import { Nullable } from "@surface/types";
import FieldInfo    from "./field-info";

export default class PropertyInfo extends FieldInfo
{
    public get getter(): Nullable<Function>
    {
        return this.descriptor.get;
    }

    public get readonly(): boolean
    {
        return super.readonly || (!!this.descriptor.get && !this.descriptor.set);
    }

    public get setter(): Nullable<Function>
    {
        return this.descriptor.set;
    }

    public constructor(key: string, descriptor: PropertyDescriptor, prototype: Object)
    {
        super(key, descriptor, prototype);
        this.descriptor = descriptor;
    }
}