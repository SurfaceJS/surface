import { Constructor, Unknown } from "..";
import { hasValue }             from "./generic";

const proxy = Symbol("proxy-factory:instance");

interface IProxyObject
{
    source: object;
    save(): void;
    undo(): void;
}

export type ProxyObject<T extends object> = { [K in keyof T]: T[K] extends Function ? T[K] : T[K] extends object ? ProxyObject<T[K]> : T[K] } & IProxyObject;

export function clone<T extends object>(source: T): T
{
    if (Array.isArray(source))
    {
        const result = [];
        for (const value of source)
        {
            if (value instanceof Object)
            {
                result.push(clone(value));
            }
            else
            {
                result.push(value);
            }
        }

        return result as T;
    }
    else
    {
        const result = Object.create(Object.getPrototypeOf(source));
        for (const key of Object.getOwnPropertyNames(source))
        {
            if (source[key] instanceof Object)
            {
                result[key] = clone(source[key]);
            }
            else
            {
                result[key] = source[key];
            }
        }
        return result as T;
    }
}

/**
 * Deeply merges two or more objects.
 * @param target Object to receive merge.
 * @param source Objects to merge to the target.
 */
export function merge<TTarget extends object, TSource extends object>(target: TTarget, source: Array<TSource>): TTarget & TSource;
/**
 * Deeply merges two or more objects, and optionally concatenate array values.
 * @param target        Object to receive merge.
 * @param source        Object to merge to the target.
 * @param combineArrays Specify to combine or not arrays.
 */
export function merge<TTarget extends object, TSource extends object>(target: TTarget, source: Array<TSource>, combineArrays: boolean): TTarget & TSource;
/**
 * Deeply merges two objects.
 * @param target Object to receive merge.
 * @param source Objects to merge to the target.
 */
export function merge<TTarget extends object, TSource extends object>(target: TTarget, source: TSource): TTarget & TSource;
/**
 * Deeply merges two objects, and optionally concatenate array values.
 * @param target Object to receive merge.
 * @param source Object to merge to the target.
 * @param combineArrays
 */
export function merge<TTarget extends object, TSource extends object>(target: TTarget, source: TSource, combineArrays: boolean): TTarget & TSource;
export function merge<TTarget extends object, TSource extends object>(target: TTarget, source: TSource|Array<TSource>, combineArrays?: boolean): TTarget & TSource
{
    combineArrays = !!combineArrays;

    if (!Array.isArray(source))
    {
        source = [source];
    }

    for (const current of source)
    {
        for (const key of Object.getOwnPropertyNames(current))
        {
            if (target[key] instanceof Object)
            {
                if (Array.isArray(target[key]) && Array.isArray(current[key]) && combineArrays)
                {
                    target[key] = target[key].concat(current[key]);
                }
                else if (current[key] instanceof Object)
                {
                    target[key] = merge(target[key], current[key], combineArrays);
                }
                else if (current[key] != undefined)
                {
                    target[key] = current[key];
                }
            }
            else if (current[key] != undefined)
            {
                target[key] = current[key];
            }
        }
    }

    return target as TTarget & TSource;
}

export function objectFactory(keys: Array<[string, Unknown]>, target?: object): object
{
    target = target || { };
    for (const entries of keys)
    {
        const [key, value] = entries;
        if (key.includes("."))
        {
            const [name, ...rest] = key.split(".");
            target[name] = objectFactory([[rest.join("."), value]], target[name]);
        }
        else
        {
            target[key] = value;
        }
    }
    return target;
}

export function proxyFactory<T extends object>(signature: T): Constructor<ProxyObject<T>>
{
    const keys = new Set<string>();
    let prototype = signature;

    do
    {
        for (const key of Object.getOwnPropertyNames(prototype))
        {
            if (!key.startsWith("_") && key != "constructor")
            {
                keys.add(key);
            }
        }
    } while ((prototype = Object.getPrototypeOf(prototype)) && prototype.constructor != Object);

    class ProxyClass<T extends object> implements IProxyObject
    {
        [key: string]: Unknown;

        private readonly _source: T;
        public get source(): T
        {
            return this._source;
        }

        public readonly [proxy]: boolean;

        public constructor(source: T)
        {
            this[proxy] = true;
            this._source = source;
        }

        public static [Symbol.hasInstance](instance: object): boolean
        {
            return instance && !!instance[proxy];
        }

        public save(): void
        {
            for (const key of keys)
            {
                const value = this[key];
                if (value instanceof ProxyClass)
                {
                    value.save();
                }
                else
                {
                    this.source[key] = value;
                }
            }
        }

        public undo(): void
        {
            for (const key of keys)
            {
                const value = this[key];
                if (value instanceof ProxyClass)
                {
                    value.undo();
                }
                else
                {
                    this[key] = this.source[key];
                }
            }
        }
    }

    for (const key of keys)
    {
        const valueProxy = signature[key] instanceof Object ? proxyFactory(signature[key]) : undefined;

        Object.defineProperty
        (
            ProxyClass.prototype,
            key,
            {
                get: function(this: ProxyClass<object>)
                {
                    if (!hasValue(this[`_${key}`]))
                    {
                        const value = this.source[key];
                        if (value instanceof Object && valueProxy)
                        {
                            this[`_${key}`] = new valueProxy(value) as Unknown;
                        }
                        else
                        {
                            this[`_${key}`] = this.source[key];
                        }
                    }

                    return this[`_${key}`];
                },
                set: function(this: ProxyClass<object>, value: Unknown)
                {
                    this[`_${key}`] = value;
                }
            }
        );
    }

    return ProxyClass as Function as Constructor<ProxyObject<T>>;
}