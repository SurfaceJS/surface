import '@surface/enumerable/extensions';
import { Enumerable } from '@surface/enumerable';
import { Nullable }   from '@surface/types';

export class Reflection<T>
{
    private _target: T
    public get target(): T
    {
        return this._target;
    }
    
    public set target(value: T)
    {
        this._target = value;
    }

    private constructor(target: T)
    {
        this._target = target;
    }

    public getKeys(): Enumerable<string>
    {
        let proto: Nullable<Object> = this._target;
        
        let keys = function* ()
        {
            do
            {
                for (const key of Object.getOwnPropertyNames(proto))
                    yield key
            } while (proto = Object.getPrototypeOf(proto));
        }

        return Enumerable.from(keys());
    }
    
    public getMethod(name: string): Nullable<Function>;
    public getMethod(name: string, caseInsensitive: boolean): Nullable<Function>;
    public getMethod(name: string, caseInsensitive?: boolean): Nullable<Function>
    {
        return this.getMethods().firstOrDefault(x => (!!caseInsensitive && new RegExp(name, 'i').test(x.name)) || x.name == name);
    }
    
    public getMethods(): Enumerable<Function>
    {
        return this.getKeys().where(x => typeof this._target[x] == 'function').select(x => this.target[x]).cast<Function>();
    }

    public static of<T>(target: T): Reflection<T>
    {
        return new Reflection(target);
    }
}