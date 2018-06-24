import { Constructor, ObjectLiteral, Unknown } from "..";
import { hasValue }                            from "./generic";

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

export function proxyFactory(source: object): Constructor<ObjectLiteral<Unknown>>
{
    class ProxyObject
    {
        [key: string]: Unknown;
        public readonly source: ObjectLiteral;
        public constructor(source: object)
        {
            this.source = source as ObjectLiteral;
        }
    }

    for (const key in source)
    {
        Object.defineProperty
        (
            ProxyObject.prototype,
            key,
            {
                get: function(this: ProxyObject)
                {
                    if (!hasValue(this[`_${key}`]))
                    {
                        const value = this.source[key];
                        if (hasValue(value) && typeof value == "object")
                        {
                            const proxy = proxyFactory(value);
                            this[`_${key}`] = new proxy(value);
                        }
                        else
                        {
                            this[`_${key}`] = this.source[key];
                        }
                    }

                    return this[`_${key}`];
                },
                set: function(this: ProxyObject, value: Unknown)
                {
                    this[`_${key}`] = value;
                }
            }
        );
    }

    return ProxyObject;
}