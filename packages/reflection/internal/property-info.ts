import FieldInfo from "./field-info.js";
import type Type from "./type.js";

export default class PropertyInfo extends FieldInfo
{
    public override get readonly(): boolean
    {
        return !!this.descriptor.get && !this.descriptor.set;
    }

    public constructor(key: string | symbol, descriptor: PropertyDescriptor, declaringType: Type, isOwn: boolean, isStatic: boolean)
    {
        super(key, descriptor, declaringType, isOwn, isStatic);
    }
}
