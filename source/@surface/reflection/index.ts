import "@surface/collection/extensions";
import "@surface/enumerable/extensions";
import "reflect-metadata";

import Dictionary   from "@surface/collection/dictionary";
import Enumerable   from "@surface/enumerable";
import { Nullable } from "@surface/types";
import FieldInfo    from "./field-info";
import MethodInfo   from "./method-info";
import PropertyInfo from "./property-info";

export default class Type
{
    private readonly targetConstructor: Function;

    private _baseType: Nullable<Type>;
    public get baseType(): Nullable<Type>
    {
        if (!this._baseType && (this.targetConstructor as Object) != Object)
        {
            this._baseType = new Type(Reflect.getPrototypeOf(this.targetConstructor.prototype)) as Nullable<Type>;
        }

        return this._baseType;
    }

    public get extensible(): boolean
    {
        return Object.isExtensible(this.targetConstructor.prototype);
    }

    public get frozen(): boolean
    {
        return Object.isFrozen(this.targetConstructor.prototype);
    }

    public get sealed(): boolean
    {
        return Object.isSealed(this.targetConstructor.prototype);
    }

    protected _metadata: Nullable<Dictionary<string, Object>>;
    public get metadata(): Dictionary<string, Object>
    {
        return this._metadata = this._metadata ||
            Reflect.getMetadataKeys(this.targetConstructor)
                .asEnumerable()
                .cast<string>()
                .toDictionary(x => x, x => Reflect.getMetadata(x, this.targetConstructor));
    }

    public get name(): string
    {
        return this.targetConstructor.name;
    }

    private constructor(target: Object)
    {
        this.targetConstructor = target.constructor;
    }

    public static from(target: Object)
    {
        return new Type(target);
    }

    public static of(target: Function): Type
    {
        return new Type(target.prototype);
    }

    private enumerateProtoChain(): Enumerable<{ key: string, descriptor: PropertyDescriptor, prototype: Object }>
    {
        let prototype = this.targetConstructor.prototype;

        let iterator = function*()
        {
            do
            {
                for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(prototype)))
                {
                    yield { key, descriptor, prototype };
                }
            } while (prototype = Object.getPrototypeOf(prototype));
        };

        return Enumerable.from(iterator());
    }

    public equals(target: Function): boolean;
    public equals(target: Type): boolean;
    public equals(target: Function|Type): boolean
    {
        if (target instanceof Type)
        {
            return this.targetConstructor == target.getConstructor();
        }

        return this.targetConstructor == target;
    }

    public extends(target: Function): boolean;
    public extends(target: Type): boolean;
    public extends(target: Function|Type): boolean
    {
        if (this.baseType)
        {
            if (target instanceof Type)
            {
                return target.getConstructor().prototype instanceof this.baseType.getConstructor();
            }

            return target.prototype instanceof this.baseType.getConstructor();
        }

        return false;
    }

    public getConstructor(): Function
    {
        return this.targetConstructor;
    }

    public getField(key: string): Nullable<FieldInfo>
    {
        return this.getFields().firstOrDefault(x => x.key == key);
    }

    public getFields(): Enumerable<FieldInfo>
    {
        return this.enumerateProtoChain()
            .where(x => !x.descriptor.get && !x.descriptor.set)
            .select(x => new FieldInfo(x.key, x.descriptor, x.prototype));
    }

    public getMethod(key: string): Nullable<MethodInfo>
    {
        return this.getMethods().firstOrDefault(x => x.key == key);
    }

    public getMethods(): Enumerable<MethodInfo>
    {
        return this.enumerateProtoChain()
            .where(x => x.descriptor.value instanceof Function)
            .select(x => new MethodInfo(x.key, x.descriptor.value, x.prototype));
    }

    public getProperty(property: string): Nullable<PropertyInfo>
    {
        return this.getProperties().firstOrDefault(x => x.key == property);
    }

    public getProperties(): Enumerable<PropertyInfo>
    {
        return this.enumerateProtoChain()
            .where(x => !(x.descriptor.value instanceof Function) && (!!x.descriptor.get || !!x.descriptor.set))
            .select(x => new PropertyInfo(x.key, x.descriptor, x.prototype));
    }

    public getPrototype(): Object
    {
        return this.targetConstructor.prototype;
    }
}