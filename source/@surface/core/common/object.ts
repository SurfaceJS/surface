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

export function proxyFactory<T extends object>(source: T): Constructor<ProxyObject<T>>
{
    const keys = new Set<string>();
    let prototype = source;

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

        private readonly _source: object;
        public get source(): object
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
                        if (hasValue(value) && typeof value == "object")
                        {
                            const proxy = proxyFactory(value);
                            this[`_${key}`] = new proxy(value) as object as Unknown;
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