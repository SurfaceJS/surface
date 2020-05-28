import FieldInfo from "./field-info";
import Type      from "./type";

export default class PropertyInfo extends FieldInfo
{
    public get readonly(): boolean
    {
        return (!!this.descriptor.get && !this.descriptor.set);
    }

    public constructor(key: string|symbol, descriptor: PropertyDescriptor, declaringType: Type, isOwn: boolean, isStatic: boolean)
    {
        super(key, descriptor, declaringType, isOwn, isStatic);
    }
}