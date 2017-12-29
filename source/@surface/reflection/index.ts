import "reflect-metadata";
import "@surface/collection/extensions";
import "@surface/enumerable/extensions";

import { KeyValuePair, Dictionary } from "@surface/collection";
import { Enumerable }               from "@surface/enumerable";
import { Nullable }                 from "@surface/types";

export abstract class MemberInfo
{
    protected _metadata: Dictionary;
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

    private _parameters: Enumerable<ParameterInfo>;
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
        }
        return this._parameters;
    }

    public constructor(key: string, proto: Object)
    {
        super(key, Type.from(proto));

        this._invoke        = proto[key];
        this._isConstructor = !!this.invoke.prototype;
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

export class PropertyInfo extends MemberInfo
{
    private _descriptor: PropertyDescriptor;

    public get configurable(): boolean
    {
        return !!this._descriptor.configurable;
    }

    public get enumerable(): boolean
    {
        return !!this._descriptor.enumerable;
    }

    public get getter(): Nullable<Function>
    {
        return this._descriptor.get;
    }

    public get readonly(): boolean
    {
        return !this._descriptor.writable || (!!this._descriptor.get && !this._descriptor.set);
    }

    public get setter(): Nullable<Function>
    {
        return this._descriptor.set;
    }

    public get value(): Nullable<Object>
    {
        return this._descriptor.value;
    }

    public constructor(key: string, proto: Object)
    {
        super(key, Type.from(proto));
        this._descriptor = Object.getOwnPropertyDescriptor(proto, key) || { };
    }
}

export class FieldInfo extends MemberInfo
{
    private _value: Nullable<Object>
    public get value(): Nullable<Object>
    {
        return this._value;
    }

    public constructor(key: string, proto: Object)
    {
        super(key, Type.from(proto));
        this._value = proto[key];
    }
}

export class Type
{
    private _constructor: Function;

    private _baseType: Nullable<Type>;
    public get baseType(): Nullable<Type>
    {
        if (!this._baseType && (this._constructor as Object) != Object)
        {
            this._baseType = new Type(Reflect.getPrototypeOf(this._constructor.prototype)) as Nullable<Type>;
        }

        return this._baseType;
    }

    public get extensible(): boolean
    {
        return Object.isExtensible(this._constructor.prototype);
    }

    public get frozen(): boolean
    {
        return Object.isFrozen(this._constructor.prototype);
    }

    public get sealed(): boolean
    {
        return Object.isSealed(this._constructor.prototype);
    }

    protected _metadata: Dictionary;
    public get metadata(): Dictionary
    {
        return this._metadata = this._metadata ||
            Reflect.getMetadataKeys(this._constructor)
                .asEnumerable()
                .cast<string>()
                .toDictionary(x => x, x => Reflect.getMetadata(x, this._constructor));
    }

    public get name(): string
    {
        return this._constructor.name;
    }

    private constructor(target: Object)
    {
        this._constructor = target.constructor;
    }

    public static from(target: Object)
    {
        return new Type(target);
    }

    public static of(target: Function): Type
    {
        return new Type(target.prototype);
    }

    private enumerateProtoChain(): Enumerable<KeyValuePair>
    {
        let proto = this._constructor.prototype;

        let iterator = function*()
        {
            do
            {
                for (const key of Object.getOwnPropertyNames(proto))
                {
                    try
                    {
                        proto[key];
                        yield new KeyValuePair(key, proto);
                    }
                    catch (error)
                    {
                        continue;
                    }
                }
            } while (proto = Object.getPrototypeOf(proto));
        }

        return Enumerable.from(iterator());
    }

    public equals(target: Function): boolean;
    public equals(target: Type): boolean;
    public equals(target: Function|Type): boolean
    {
        if (target instanceof Type)
        {
            return this._constructor == target.getConstructor();
        }

        return this._constructor == target;
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
        return this._constructor;
    }

    public getProperty(property: string): Nullable<PropertyInfo>
    {
        return this.getProperties().firstOrDefault(x => x.key == property);
    }

    public getPrototype(): Object
    {
        return this._constructor.prototype;
    }

    public getMethod(key: string): Nullable<MethodInfo>
    {
        return this.getMethods()
            .where(x => x.key == key).firstOrDefault();
    }

    public getMethods(): Enumerable<MethodInfo>
    {
        return this.enumerateProtoChain()
            .where(x => x.value[x.key] instanceof Function)
            .select(x => new MethodInfo(x.key, x.value));
    }

    public getProperties(): Enumerable<PropertyInfo>
    {
        return this.enumerateProtoChain()
            .where(x => !(x.value[x.key] instanceof Function))
            .select(x => new PropertyInfo(x.key, x.value));
    }

    public getValue(property: string): Nullable<Object>
    {
        let context = this._constructor.prototype;

        if (property.indexOf(".") > -1)
        {
            let childrens = property.split(".");
            for (let child of childrens)
            {
                context = context[child];
                if (!context)
                {
                    break;
                }
            }
        }

        return context;
    }
}