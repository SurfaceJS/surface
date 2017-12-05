import "@surface/enumerable/extensions";
import { Enumerable }            from "@surface/enumerable";
import { Nullable, Constructor } from "@surface/types";

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
        let keys = function* (this: Reflection<T>)
        {
            for (const key of Object.getOwnPropertyNames(this._instace).concat(Object.getOwnPropertyNames(this._type.prototype)))
            {
                yield key;
            }
        }
        .bind(this);

        return Enumerable.from(keys());
    }

    public getMethod(name: string): Nullable<Function>;
    public getMethod(name: string, caseSensitive: boolean): Nullable<Function>;
    public getMethod(name: string, caseSensitive?: boolean): Nullable<Function>
    {
        return this.getMethods().firstOrDefault(x => (!!caseSensitive && x.name == name || new RegExp(name, "i").test(x.name)));
    }

    public getMethods(): Enumerable<Function>
    {
        return this.getKeys().where(x => this._instace[x] instanceof Function).select(x => this._instace[x]).cast<Function>();
    }
}