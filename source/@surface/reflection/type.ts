import "reflect-metadata";

import { Nullable, Unknown } from "@surface/types";
import FieldInfo             from "./field-info";
import MemberInfo            from "./member-info";
import MethodInfo            from "./method-info";
import PropertyInfo          from "./property-info";

type Member = { key: string, descriptor: PropertyDescriptor, declaringType: Type, isStatic: boolean };

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

    private _metadata: Nullable<Object>;
    public get metadata(): Object
    {
        if (!this._metadata)
        {
            const metadata = { };

            Reflect.getMetadataKeys(this.targetConstructor)
                .forEach(/* istanbul ignore next */ x => metadata[x] = Reflect.getMetadata(x, this.targetConstructor));

            this._metadata = metadata;
        }

        return this._metadata;
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

    private *enumerateMembers(): IterableIterator<Member>
    {
        let prototype = this.targetConstructor.prototype;

        do
        {
            for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(prototype)))
            {
                yield { key, descriptor, declaringType: Type.from(prototype), isStatic: false };
            }
        } while (prototype = Object.getPrototypeOf(prototype));
    }

    private *enumerateStaticMembers(): IterableIterator<Member>
    {
        let targetConstructor = this.targetConstructor;

        do
        {
            for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(targetConstructor)))
            {
                yield { key, descriptor, declaringType: Type.of(targetConstructor), isStatic: true };
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
    }

    private getMemberType(member: Member): MemberInfo
    {
        if (member.descriptor.value instanceof Function)
        {
            return new MethodInfo(member.key, member.descriptor.value, member.declaringType, member.isStatic);
        }
        else if (!(member.descriptor.value instanceof Function) && (!!member.descriptor.set || !!member.descriptor.get))
        {
            return new PropertyInfo(member.key, member.descriptor, member.declaringType, member.isStatic);
        }
        else
        {
            return new FieldInfo(member.key, member.descriptor, member.declaringType, member.isStatic);
        }
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

    public *getFields(): IterableIterator<FieldInfo>
    {
        for (const x of this.enumerateMembers())
        {
            if (!(x.descriptor.value instanceof Function) && !x.descriptor.get && !x.descriptor.set)
            {
                yield new FieldInfo(x.key, x.descriptor, x.declaringType, false);
            }
        }
    }

    public getMember(key: string): Nullable<MemberInfo>
    {
        let prototype = this.targetConstructor.prototype;

        do
        {
            const descriptor = Object.getOwnPropertyDescriptor(prototype, key);

            if (descriptor)
            {
                return this.getMemberType({ key, descriptor, declaringType: Type.from(prototype), isStatic: false });
            }
        } while (prototype = Object.getPrototypeOf(prototype));

        return null;
    }

    public *getMembers(): IterableIterator<MemberInfo>
    {
        for (const element of this.enumerateMembers())
        {
            yield this.getMemberType(element);
        }
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

    public *getMethods(): IterableIterator<MethodInfo>
    {
        for (const x of this.enumerateMembers())
        {
            if (x.descriptor.value instanceof Function)
            {
                yield new MethodInfo(x.key, x.descriptor.value, x.declaringType, false);
            }
        }
    }

    public *getProperties(): IterableIterator<PropertyInfo>
    {
        for (const x of this.enumerateMembers())
        {
            if (!(x.descriptor.value instanceof Function) && (!!x.descriptor.set || !!x.descriptor.get))
            {
                yield new PropertyInfo(x.key, x.descriptor, x.declaringType, false);
            }
        }
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

    public *getStaticFields(): IterableIterator<FieldInfo>
    {
        for (const x of this.enumerateStaticMembers())
        {
            if (!(x.descriptor.value instanceof Function) && !x.descriptor.get && !x.descriptor.set)
            {
                yield new FieldInfo(x.key, x.descriptor, x.declaringType, true);
            }
        }
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

    public *getStaticMembers(): IterableIterator<MemberInfo>
    {
        for (const element of this.enumerateStaticMembers())
        {
            yield this.getMemberType(element);
        }
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

    public *getStaticMethods(): IterableIterator<MethodInfo>
    {
        for(const element of this.enumerateStaticMembers())
        {
            if (element.descriptor.value instanceof Function)
            {
                yield new MethodInfo(element.key, element.descriptor.value, element.declaringType, false);
            }
        }
    }

    public *getStaticProperties(): IterableIterator<PropertyInfo>
    {
        for (const x of this.enumerateStaticMembers())
        {
            if(!(x.descriptor.value instanceof Function) && (!!x.descriptor.set || !!x.descriptor.get))
            {
                yield new PropertyInfo(x.key, x.descriptor, x.declaringType, true);
            }
        }
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