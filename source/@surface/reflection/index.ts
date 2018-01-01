import "reflect-metadata";
import "@surface/collection/extensions";
import "@surface/enumerable/extensions";

import { Dictionary } from "@surface/collection";
import { Enumerable } from "@surface/enumerable";
import { Nullable }   from "@surface/types";

export abstract class MemberInfo
{
    protected _metadata: Nullable<Dictionary>;
    public get metadata(): Dictionary
    {
        return this._metadata = this._metadata ||
            Reflect.getMetadataKeys(this._declaringType.getPrototype(), this.key)
                .asEnumerable()
                .cast<string>()
                .toDictionary(x => x, x => Reflect.getMetadata(x, this._declaringType.getPrototype(), this.key));
    }

    protected _declaringType: Type;
    public get declaringType(): Type
    {
        return this._declaringType;
    }

    protected _key: string;
    public get key(): string
    {
        return this._key;
    }

    protected constructor(key: string, declaringType: Type)
    {
        this._key           = key;
        this._declaringType = declaringType;
    }
}

export class MethodInfo extends MemberInfo
{
    private _invoke: Function;
    public get invoke(): Function
    {
        return this._invoke;
    }

    private _isConstructor: boolean;
    public get isConstructor(): boolean
    {
        return this._isConstructor;
    }

    private _parameters: Nullable<Enumerable<ParameterInfo>>;
    public get parameters(): Enumerable<ParameterInfo>
    {
        if (!this._parameters)
        {
            let match = /^(?:(?:function\s+(?:\w+)?)|\w+)\(([^)]+)\)/.exec(this.invoke.toString());

            if (match)
            {
                let paramTypes = this.metadata.has("design:paramtypes") && this.metadata.get("design:paramtypes") || [];

                this._parameters = match[1].split(",")
                    .asEnumerable()
                    .zip(paramTypes as Array<Object>, (a, b) => ({ key: a, paramType: b }) )
                    .select(x => new ParameterInfo(x.key, this.invoke, this.declaringType, x.paramType));
            }
            else
            {
                this._parameters = Enumerable.empty();
            }
        }

        return this._parameters;
    }

    public constructor(key: string, invoke: Function, prototype: Object)
    {
        super(key, Type.from(prototype));

        this._invoke        = invoke;
        this._isConstructor = !!invoke.prototype;
    }
}

export class ParameterInfo extends MemberInfo
{
    private _declaringMethod: Function;
    public get declaringMethod(): Function
    {
        return this._declaringMethod;
    }

    public constructor(key: string, declaringMethod: Function, declaringType: Type, paramType: Nullable<Object>)
    {
        super(key, declaringType);

        this._declaringMethod = declaringMethod;

        if (paramType)
        {
            this._metadata = new Dictionary({ "design:type": paramType });
        }
    }
}

export class FieldInfo extends MemberInfo
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

export class PropertyInfo extends FieldInfo
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

export class Type
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

    protected _metadata: Nullable<Dictionary>;
    public get metadata(): Dictionary
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

    public getFields(): Enumerable<FieldInfo>
    {
        return this.enumerateProtoChain()
            .where(x => !(x.descriptor.value instanceof Function) && !x.descriptor.get && !x.descriptor.set)
            .select(x => new FieldInfo(x.key, x.descriptor, x.prototype));
    }

    public getProperty(property: string): Nullable<PropertyInfo>
    {
        return this.getProperties().firstOrDefault(x => x.key == property);
    }

    public getPrototype(): Object
    {
        return this.targetConstructor.prototype;
    }

    public getMethod(key: string): Nullable<MethodInfo>
    {
        return this.getMethods()
            .where(x => x.key == key).firstOrDefault();
    }

    public getMethods(): Enumerable<MethodInfo>
    {
        return this.enumerateProtoChain()
            .where(x => x.descriptor.value instanceof Function)
            .select(x => new MethodInfo(x.key, x.descriptor.value, x.prototype));
    }

    public getProperties(): Enumerable<PropertyInfo>
    {
        return this.enumerateProtoChain()
            .where(x => !(x.descriptor.value instanceof Function) && (!!x.descriptor.get || !!x.descriptor.set))
            .select(x => new PropertyInfo(x.key, x.descriptor, x.prototype));
    }
}