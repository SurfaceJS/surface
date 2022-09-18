import type { Indexer } from "@surface/core";
import FieldInfo        from "./field-info.js";
import type MemberInfo  from "./member-info.js";
import MethodInfo       from "./method-info.js";
import PropertyInfo     from "./property-info.js";

type Member =
{
    declaringType: Type,
    descriptor:    PropertyDescriptor,
    isOwn:         boolean,
    isStatic:      boolean,
    key:           string | symbol,
};

export default class Type
{
    private _baseType: Type | null = null;

    private readonly instance:  object;
    private readonly prototype: object;

    public get baseType(): Type | null
    {
        if (!this._baseType && this.prototype.constructor != Object)
        {
            this._baseType = new Type(Reflect.getPrototypeOf(this.prototype)!.constructor.prototype) as Type | null;
        }

        return this._baseType;
    }

    public get extensible(): boolean
    {
        return Object.isExtensible(this.prototype);
    }

    public get frozen(): boolean
    {
        return Object.isFrozen(this.prototype);
    }

    public get sealed(): boolean
    {
        return Object.isSealed(this.prototype);
    }

    public get name(): string
    {
        return this.prototype.constructor.name;
    }

    private constructor(instance: object)
    {
        this.instance  = instance;
        this.prototype = instance.constructor.prototype;
    }

    public static from(instance: object): Type
    {
        return new Type(instance);
    }

    public static of(constructor: Function): Type
    {
        return new Type(constructor.prototype);
    }

    private *enumerateMembers(): IterableIterator<Member>
    {
        let prototype = this.instance;
        let type      = this as Type;

        do
        {
            for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(prototype)))
            {
                if (!key.startsWith("_"))
                {
                    yield { declaringType: type, descriptor, isOwn: this.isOwn(key, prototype!), isStatic: false, key };
                }
            }
        } while (((prototype as object | null) = Reflect.getPrototypeOf(prototype)) && (type = Type.from(prototype)));
    }

    private *enumerateStaticMembers(): IterableIterator<Member>
    {
        let constructor = this.prototype.constructor;
        let type        = this as Type;

        do
        {
            for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(constructor)))
            {
                yield { declaringType: type, descriptor, isOwn: true, isStatic: true, key };
            }

            const prototype = Object.getPrototypeOf(constructor.prototype) as Indexer | null;

            if (prototype)
            {
                constructor = prototype.constructor;
                type        = Type.of(constructor);
            }
            else
            {
                break;
            }

        } while (true);
    }

    private getMemberType(member: Member): MemberInfo
    {
        if (member.descriptor.value instanceof Function)
        {
            return new MethodInfo(member.key, member.descriptor, member.declaringType, member.isOwn, member.isStatic);
        }
        else if (!(member.descriptor.value instanceof Function) && (!!member.descriptor.set || !!member.descriptor.get))
        {
            return new PropertyInfo(member.key, member.descriptor, member.declaringType, member.isOwn, member.isStatic);
        }

        return new FieldInfo(member.key, member.descriptor, member.declaringType, member.isOwn, member.isStatic);
    }

    private isOwn(key: string | symbol, instance: object): boolean
    {
        return instance != instance.constructor.prototype && instance.hasOwnProperty(key);
    }

    public equals(type: Type): boolean;
    public equals(constructor: Function): boolean;
    public equals(typeOrConstructor: Function | Type): boolean
    {
        if (typeOrConstructor instanceof Type)
        {
            return this.prototype.constructor == typeOrConstructor.getConstructor();
        }

        return this.prototype.constructor == typeOrConstructor;
    }

    public extends(target: Function): boolean;
    public extends(target: Type): boolean;
    public extends(target: Function | Type): boolean
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
        return this.prototype.constructor;
    }

    public getField(key: string): FieldInfo | null
    {
        const memberInfo = this.getMember(key);

        if (memberInfo instanceof FieldInfo)
        {
            return memberInfo;
        }

        return null;
    }

    public *getFields(): IterableIterator<FieldInfo>
    {
        for (const member of this.enumerateMembers())
        {
            if (!(member.descriptor.value instanceof Function) && !member.descriptor.get && !member.descriptor.set)
            {
                yield new FieldInfo(member.key, member.descriptor, member.declaringType, member.isOwn, false);
            }
        }
    }

    public getMember(key: string | symbol): MemberInfo | null
    {
        let prototype: object | null = this.instance;
        let type:      Type          = this;

        do
        {
            const descriptor = Object.getOwnPropertyDescriptor(prototype, key);

            if (descriptor)
            {
                return this.getMemberType({ declaringType: type, descriptor, isOwn: this.isOwn(key, prototype), isStatic: false, key });
            }
        } while ((prototype = Reflect.getPrototypeOf(prototype)) && (type = Type.from(prototype)));

        return null;
    }

    public *getMembers(): IterableIterator<MemberInfo>
    {
        for (const element of this.enumerateMembers())
        {
            yield this.getMemberType(element);
        }
    }

    public getMethod(key: string | symbol): MethodInfo | null
    {
        const memberInfo = this.getMember(key);

        if (memberInfo instanceof MethodInfo)
        {
            return memberInfo;
        }

        return null;
    }

    public *getMethods(): IterableIterator<MethodInfo>
    {
        for (const member of this.enumerateMembers())
        {
            if (member.descriptor.value instanceof Function)
            {
                yield new MethodInfo(member.key, member.descriptor, member.declaringType, member.isOwn, false);
            }
        }
    }

    public *getProperties(): IterableIterator<PropertyInfo>
    {
        for (const member of this.enumerateMembers())
        {
            if (!(member.descriptor.value instanceof Function) && (!!member.descriptor.set || !!member.descriptor.get))
            {
                yield new PropertyInfo(member.key, member.descriptor, member.declaringType, member.isOwn, false);
            }
        }
    }

    public getProperty(key: string | symbol): PropertyInfo | null
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
        return this.prototype;
    }

    public getStaticField(key: string | symbol): FieldInfo | null
    {
        const memberInfo = this.getStaticMember(key);

        if (memberInfo instanceof FieldInfo)
        {
            return memberInfo;
        }

        return null;
    }

    public *getStaticFields(): IterableIterator<FieldInfo>
    {
        for (const member of this.enumerateStaticMembers())
        {
            if (!(member.descriptor.value instanceof Function) && !member.descriptor.get && !member.descriptor.set)
            {
                yield new FieldInfo(member.key, member.descriptor, member.declaringType, member.isOwn, true);
            }
        }
    }

    public getStaticMember(key: string | symbol): MemberInfo | null
    {
        let constructor = this.prototype.constructor;
        let type        = this as Type;
        do
        {
            const descriptor = Object.getOwnPropertyDescriptor(constructor, key);

            if (descriptor)
            {
                if (descriptor.value instanceof Function)
                {
                    return new MethodInfo(key, descriptor, type, true, true);
                }
                else if (!(descriptor.value instanceof Function) && (!!descriptor.set || !!descriptor.get))
                {
                    return new PropertyInfo(key, descriptor, type, true, true);
                }

                return new FieldInfo(key, descriptor, type, true, true);
            }

            const prototype = Object.getPrototypeOf(constructor.prototype) as Indexer | null;

            if (prototype)
            {
                constructor = prototype.constructor;
                type        = Type.of(constructor);
            }
            else
            {
                break;
            }
        // eslint-disable-next-line no-constant-condition
        } while (true);

        return null;
    }

    public *getStaticMembers(): IterableIterator<MemberInfo>
    {
        for (const element of this.enumerateStaticMembers())
        {
            yield this.getMemberType(element);
        }
    }

    public getStaticMethod(key: string | symbol): MethodInfo | null
    {
        const memberInfo = this.getStaticMember(key);

        if (memberInfo instanceof MethodInfo)
        {
            return memberInfo;
        }

        return null;
    }

    public *getStaticMethods(): IterableIterator<MethodInfo>
    {
        for (const member of this.enumerateStaticMembers())
        {
            if (member.descriptor.value instanceof Function)
            {
                yield new MethodInfo(member.key, member.descriptor, member.declaringType, member.isOwn, false);
            }
        }
    }

    public *getStaticProperties(): IterableIterator<PropertyInfo>
    {
        for (const member of this.enumerateStaticMembers())
        {
            if (!(member.descriptor.value instanceof Function) && (!!member.descriptor.set || !!member.descriptor.get))
            {
                yield new PropertyInfo(member.key, member.descriptor, member.declaringType, member.isOwn, true);
            }
        }
    }

    public getStaticProperty(key: string | symbol): PropertyInfo | null
    {
        const memberInfo = this.getStaticMember(key);

        if (memberInfo instanceof PropertyInfo)
        {
            return memberInfo;
        }

        return null;
    }
}