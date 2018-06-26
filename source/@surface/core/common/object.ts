import { Constructor, Unknown } from "..";
import { hasValue }             from "./generic";

const proxy = Symbol("proxy-factory:instance");

interface IProxyObject
{
    save(): void;
    undo(): void;
}

type ProxyObject<T extends object> = { [K in keyof T]: T[K] extends Function ? T[K] : T[K] extends object ? ProxyObject<T[K]> & IProxyObject : T[K] } & IProxyObject;
type ProxyType<T extends object> = ProxyObject<T>;

export function objectFactory(keys: Array<string>, target?: object): object
{
    target = target || { };
    for (const key of keys)
    {
        if (key.includes("."))
        {
            const [name, ...rest] = key.split(".");
            target[name] = objectFactory([rest.join(".")], target[name]);
        }
        else
        {
            target[key] = undefined;
        }
    }
    return target;
}

export function proxyFactory<T extends object>(source: T): Constructor<ProxyObject<T>>
{
    const keys =
    (
        source.constructor == Object ?
            Object.getOwnPropertyNames(source) :
            Object.getOwnPropertyNames(source).concat(Object.getOwnPropertyNames(source.constructor.prototype))
    )
    .filter(x => !x.startsWith("_") && x != "constructor");

    class ProxyObject<T extends object> implements IProxyObject
    {
        [key: string]: Unknown;

        public readonly [proxy]: boolean;

        public readonly source: T;
        public constructor(source: T)
        {
            this[proxy] = true;
            this.source = source;
        }

        public static [Symbol.hasInstance](instance: object): boolean
        {
            return hasValue(instance[proxy]);
        }

        public save(): void
        {
            for (const key of keys)
            {
                const value = this[key];
                if (value instanceof ProxyObject)
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
                if (value instanceof ProxyObject)
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
            ProxyObject.prototype,
            key,
            {
                get: function(this: ProxyObject<object>)
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
                set: function(this: ProxyObject<object>, value: Unknown)
                {
                    this[`_${key}`] = value;
                }
            }
        );
    }

    return ProxyObject as Function as Constructor<ProxyType<T>>;
}