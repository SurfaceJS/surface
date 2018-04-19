import "@surface/collection/extensions";
import "@surface/enumerable/extensions";
import "reflect-metadata";

import Dictionary            from "@surface/collection/dictionary";
import Enumerable            from "@surface/enumerable";
import { Nullable, Unknown } from "@surface/types";
import FieldInfo             from "./field-info";
import MemberInfo            from "./member-info";
import MethodInfo            from "./method-info";
import PropertyInfo          from "./property-info";

type Member = { key: string, descriptor: PropertyDescriptor, declaringType: Type };

export default class Type
{
    private readonly targetConstructor: Function;

    private _baseType: Nullable<Type> = null;
    public get baseType(): Nullable<Type>
    {
        if (!this._baseType && (this.targetConstructor as Object) != Object)
        {
            this._baseType = new Type(Reflect.getPrototypeOf(this.targetConstructor.prototype).constructor) as Nullable<Type>;
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

    private _metadata: Nullable<Dictionary<string, Object>>;
    public get metadata(): Dictionary<string, Object>
    {
        return this._metadata = this._metadata ||
            Reflect.getMetadataKeys(this.targetConstructor)
                .asEnumerable()
                .cast<string>()
                .toDictionary(/* istanbul ignore next */ x => x, /* istanbul ignore next */ x => Reflect.getMetadata(x, this.targetConstructor));
    }

    public get name(): string
    {
        return this.targetConstructor.name;
    }

    private constructor(target: Function)
    {
        this.targetConstructor = target;
    }

    public static from(target: Object)
    {
        return new Type(target.constructor);
    }

    public static of(target: Function): Type
    {
        return new Type(target);
    }

    private enumerateMembers(): Enumerable<Member>
    {
        let prototype = this.targetConstructor.prototype;

        let iterator = function*()
        {
            do
            {
                for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(prototype)))
                {
                    yield { key, descriptor, declaringType: Type.from(prototype) };
                }
            } while (prototype = Object.getPrototypeOf(prototype));
        };

        return Enumerable.from(iterator());
    }

    private enumerateStaticMembers(): Enumerable<Member>
    {
        let targetConstructor = this.targetConstructor;

        let iterator = function*()
        {
            do
            {
                for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(targetConstructor)))
                {
                    yield { key, descriptor, declaringType: Type.of(targetConstructor) };
                }

                let prototype = Object.getPrototypeOf(targetConstructor.prototype) as Unknown;

                if (prototype)
                {
                    targetConstructor = prototype.constructor;
                }
                else
                {
                    break;
                }

            } while (true);
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
                return this.getPrototype() instanceof target.getConstructor();
            }

            return this.getPrototype() instanceof target;
        }

        return false;
    }

    public getConstructor(): Function
    {
        return this.targetConstructor;
    }

    public getField(key: string): Nullable<FieldInfo>
    {
        const memberInfo = this.getMember(key);

        if (memberInfo instanceof FieldInfo)
        {
            return memberInfo;
        }

        return null;
    }

    public getFields(): Enumerable<FieldInfo>
    {
        return this.enumerateMembers()
            .where(x => !(x.descriptor.value instanceof Function) && !x.descriptor.get && !x.descriptor.set)
            .select(x => new FieldInfo(x.key, x.descriptor, x.declaringType, false));
    }

    public getMember(key: string): Nullable<MemberInfo>
    {
        let prototype = this.targetConstructor.prototype;

        do
        {
            const descriptor = Object.getOwnPropertyDescriptor(prototype, key);

            if (descriptor)
            {
                if (descriptor.value instanceof Function)
                {
                    return new MethodInfo(key, descriptor.value, Type.from(prototype), false);
                }
                else if (!(descriptor.value instanceof Function) && (!!descriptor.set || !!descriptor.get))
                {
                    return new PropertyInfo(key, descriptor, Type.from(prototype), false);
                }
                else
                {
                    return new FieldInfo(key, descriptor, Type.from(prototype), false);
                }
            }
        } while (prototype = Object.getPrototypeOf(prototype));

        return null;
    }

    public getMethod(key: string): Nullable<MethodInfo>
    {
        const memberInfo = this.getMember(key);

        if (memberInfo instanceof MethodInfo)
        {
            return memberInfo;
        }

        return null;
    }

    public getMethods(): Enumerable<MethodInfo>
    {
        return this.enumerateMembers()
            .where(x => x.descriptor.value instanceof Function)
            .select(x => new MethodInfo(x.key, x.descriptor.value, x.declaringType, false));
    }

    public getProperties(): Enumerable<PropertyInfo>
    {
        return this.enumerateMembers()
            .where(x => !(x.descriptor.value instanceof Function) && (!!x.descriptor.set || !!x.descriptor.get))
            .select(x => new PropertyInfo(x.key, x.descriptor, x.declaringType, false));
    }

    public getProperty(key: string): Nullable<PropertyInfo>
    {
        const memberInfo = this.getMember(key);

        if (memberInfo instanceof PropertyInfo)
        {
            return memberInfo;
        }

        return null;
    }

    public getPrototype(): Object
    {
        return this.targetConstructor.prototype;
    }

    public getStaticField(key: string): Nullable<FieldInfo>
    {
        const memberInfo = this.getStaticMember(key);

        if (memberInfo instanceof FieldInfo)
        {
            return memberInfo;
        }

        return null;
    }

    public getStaticFields(): Enumerable<FieldInfo>
    {
        return this.enumerateStaticMembers()
            .where(x => !(x.descriptor.value instanceof Function) && !x.descriptor.get && !x.descriptor.set)
            .select(x => new FieldInfo(x.key, x.descriptor, x.declaringType, true));
    }

    public getStaticMember(key: string): Nullable<MemberInfo>
    {
        let targetConstructor = this.targetConstructor;

        do
        {
            const descriptor = Object.getOwnPropertyDescriptor(targetConstructor, key);

            if (descriptor)
            {
                if (descriptor.value instanceof Function)
                {
                    return new MethodInfo(key, descriptor.value, Type.of(targetConstructor), true);
                }
                else if (!(descriptor.value instanceof Function) && (!!descriptor.set || !!descriptor.get))
                {
                    return new PropertyInfo(key, descriptor, Type.of(targetConstructor), true);
                }
                else
                {
                    return new FieldInfo(key, descriptor, Type.of(targetConstructor), true);
                }
            }

            let prototype = Object.getPrototypeOf(targetConstructor.prototype) as Unknown;

            if (prototype)
            {
                targetConstructor = prototype.constructor;
            }
            else
            {
                break;
            }

        } while (true);

        return null;
    }

    public getStaticMethod(key: string): Nullable<MethodInfo>
    {
        const memberInfo = this.getStaticMember(key);

        if (memberInfo instanceof MethodInfo)
        {
            return memberInfo;
        }

        return null;
    }

    public getStaticMethods(): Enumerable<MethodInfo>
    {
        return this.enumerateStaticMembers()
            .where(x => x.descriptor.value instanceof Function)
            .select(x => new MethodInfo(x.key, x.descriptor.value, x.declaringType, false));
    }

    public getStaticProperties(): Enumerable<PropertyInfo>
    {
        return this.enumerateStaticMembers()
            .where(x => !(x.descriptor.value instanceof Function) && (!!x.descriptor.set || !!x.descriptor.get))
            .select(x => new PropertyInfo(x.key, x.descriptor, x.declaringType, true));
    }

    public getStaticProperty(key: string): Nullable<PropertyInfo>
    {
        const memberInfo = this.getStaticMember(key);

        if (memberInfo instanceof PropertyInfo)
        {
            return memberInfo;
        }

        return null;
    }
}