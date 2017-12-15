import "@surface/enumerable/extensions";
import { Enumerable }            from "@surface/enumerable";
import { Nullable, Constructor } from "@surface/types";

export type KeyPropertyDescriptor = { key: string, descriptor: PropertyDescriptor };

export class Reflection<T>
{
    private _baseType: Constructor;
    public get baseType(): Constructor
    {
        return this._baseType;
    }

    private _instace: T;
    public get instace(): T
    {
        return this._instace;
    }

    private _type: Constructor<T>;
    public get type(): Constructor<T>
    {
        return this._type;
    }

    private constructor(target: T)
    {
        this._instace  = target;
        this._type     = target["__proto__"]["constructor"];
        this._baseType = target["__proto__"]["__proto__"] && target["__proto__"]["__proto__"]["constructor"];
    }

    public static of<T>(target: T): Reflection<T>
    {
        return new Reflection(target);
    }

    public getKeys(): Enumerable<string>
    {
        return Enumerable.from(Object.getOwnPropertyNames(this._instace).concat(Object.getOwnPropertyNames(this._type.prototype)));
    }

    public getProperty(property: string): Nullable<Object>
    {
        let context = this._instace;

        if (property.indexOf(".") > -1)
        {
            let childrens = property.split(".");
            property = childrens.pop() || "";
            for (let child of childrens)
            {
                context = context[child];
                if (!context)
                {
                    break;
                }
            }

            return context;
        }
        else
        {
            return context[property];
        }
    }

    public getPropertyDescriptor(property: string): Nullable<KeyPropertyDescriptor>
    {
        return this.getPropertyDescriptors().firstOrDefault(x => x.key == property);
    }

    public getPropertyDescriptors(): Enumerable<KeyPropertyDescriptor>
    {
        return this.getKeys()
            .select(x => ({ key: x, descriptor: Object.getOwnPropertyDescriptor(this._instace, x) }))
            .where(x => !!x.descriptor)
            .cast<KeyPropertyDescriptor>();
    }

    public getMethod(name: string): Nullable<Function>
    {
        return this.getMethods().firstOrDefault(x => x.name == name);
    }

    public getMethods(): Enumerable<Function>
    {
        return this.getKeys()
            .select(x => this._type.prototype[x] || this._instace[x])
            .where(x => x instanceof Function && !x.prototype)
            .cast<Function>();
    }

    public getConstructor(name: string): Nullable<Constructor>
    {
        return this.getConstructors().firstOrDefault(x => x.name == name);
    }

    public getConstructors(): Enumerable<Constructor>
    {
        return this.getKeys()
            .select(x => this._type.prototype[x] || this._instace[x])
            .where(x => x instanceof Function && !!x.prototype)
            .cast<Constructor>();
    }
}