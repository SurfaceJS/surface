import { Combine, Constructor, Func1, Indexer, Mixer } from "..";
import Hashcode                                        from "../hashcode";
import { assert, typeGuard }                           from "./generic";

export function clone<T extends object>(source: T): T;
export function clone(source: Indexer): Indexer
{
    if (Array.isArray(source))
    {
        const values: Array<unknown> = [];
        for (const value of source)
        {
            if (value instanceof Object)
            {
                values.push(clone(value));
            }
            else
            {
                values.push(value);
            }
        }

        return values as Indexer;
    }
    else
    {
        const prototype: Indexer = Object.create(Object.getPrototypeOf(source));

        for (const key of Object.getOwnPropertyNames(source))
        {
            const value = source[key];

            if (value instanceof Object)
            {
                prototype[key] = clone(value);
            }
            else
            {
                prototype[key] = value;
            }
        }
        return prototype;
    }
}

export function freeze<T extends object>(target: T): T;
export function freeze(target: Indexer): Indexer
{
    for (const value of Object.values(target))
    {
        if (value instanceof Object)
        {
            freeze(value);
        }
    }

    return Object.freeze(target);
}

export function getKeyMember<T extends object>(target: T, path: string|Array<string>): [string, T];
export function getKeyMember(target: Indexer, path: string|Array<string>): [string, Indexer]
{
    const [key, ...keys] = Array.isArray(path) ? path : path.split(".");

    if (keys.length > 0)
    {
        if (key in target)
        {
            const member = target[key];

            if (member instanceof Object)
            {
                return getKeyMember(member as Indexer, keys);
            }
        }
        else
        {
            const typeName = target instanceof Function ? target.name : target.constructor.name;
            throw new Error(`Member ${key} does not exist in type ${typeName}`);
        }
    }

    return [key, target];
}

export function getKeyValue<TTarget extends object, TValue = unknown>(target: TTarget, path: string|Array<string>): [string, TValue];
export function getKeyValue(target: Indexer, path: string|Array<string>): [string, unknown]
{
    const [key, member] = getKeyMember(target, path);

    return [key, member[key]];
}

export function getValue<TTarget extends object, T = unknown>(target: TTarget, path: string|Array<string>): T|undefined
{
    try
    {
        return getKeyValue<TTarget, T>(target, path)[1];
    }
    catch
    {
        return undefined;
    }
}

/**
 * Inject an action to be executed after instantiation.
 * @param constructor target constructor
 * @param action action to be executed
 */
export function injectToConstructor<T extends Constructor>(constructor: T, action: Func1<InstanceType<T>, InstanceType<T>>): T
{
    const proxy =
    {
        [constructor.name]: function(...args: Array<unknown>)
        {
            const instance = Reflect.construct(constructor, args, new.target) as InstanceType<T>;

            return action(instance);
        }
    }[constructor.name];

    Object.setPrototypeOf(proxy, Object.getPrototypeOf(constructor));
    Object.defineProperties(proxy, Object.getOwnPropertyDescriptors(constructor));

    proxy.prototype.constructor = proxy;

    return proxy as unknown as T;
}

/**
 * Deeply merges two or more objects.
 * @param sources Objects to merge.
 */
export function merge<TInstances extends Array<object>>(sources: TInstances, combineArrays?: boolean): Combine<TInstances>;
export function merge(sources: Array<Indexer>, combineArrays?: boolean): Indexer
{
    const target: Indexer = { };

    for (const current of sources)
    {
        for (const key of Object.getOwnPropertyNames(current))
        {
            const targetValue  = target[key];
            const currentValue = current[key];

            if (typeGuard<Indexer>(targetValue, targetValue instanceof Object))
            {
                if (Array.isArray(targetValue) && Array.isArray(currentValue) && combineArrays)
                {
                    targetValue.push(...currentValue);
                }
                else if (typeGuard<Indexer>(currentValue, currentValue instanceof Object))
                {
                    target[key] = merge([targetValue, currentValue]);
                }
                else if (currentValue != undefined)
                {
                    target[key] = currentValue;
                }
            }
            else if (currentValue != undefined)
            {
                target[key] = currentValue;
            }
        }
    }

    return target;
}


export function mixer<TConstructor extends Constructor, TMixins extends Array<(superClass: TConstructor) => Constructor>, TMixer extends Mixer<TConstructor, TMixins>>(constructor: TConstructor, mixins: TMixins): TMixer
{
    assert(mixins.length > 0, "Mixer requires at least one mixin");

    const mixin = mixins.pop()!;

    const $class = mixin(constructor);

    if (mixins.length > 0)
    {
        return mixer($class as TConstructor, mixins);
    }
    else
    {
        return $class as TMixer;
    }
}

/**
 * Create an object using the provided keys.
 * @param keys   Object keys
 * @param target If provided, all keys will inserted on target object
 */
export function objectFactory(keys: Array<[string, unknown]>, target?: Indexer): object
{
    target = target ?? { };
    for (const entries of keys)
    {
        const [key, value] = entries;
        if (key.includes("."))
        {
            const [name, ...rest] = key.split(".");
            target[name] = objectFactory([[rest.join("."), value]], target[name] as Indexer);
        }
        else
        {
            target[key] = value;
        }
    }
    return target;
}

export function overrideProperty<T>(target: T, property: string|symbol, action: (instance: T, newValue: unknown, oldValue: unknown) => void, descriptor: PropertyDescriptor|null, beforeSetter?: boolean): PropertyDescriptor
{
    let propertyDescriptor: PropertyDescriptor;

    const currentDescriptor = descriptor ?? Object.getOwnPropertyDescriptor(target, property);

    if (currentDescriptor?.set)
    {
        propertyDescriptor =
        {
            configurable: currentDescriptor.configurable,
            enumerable:   currentDescriptor.enumerable,
            get: currentDescriptor.get,
            set: beforeSetter
                ? function(this: T, value: unknown)
                {
                    const oldValue = currentDescriptor.get?.call(this);

                    if (Object.is(oldValue, value))
                    {
                        action(this, oldValue, value);

                        currentDescriptor.set!.call(this, value);
                    }

                }
                : function(this: T, value: unknown)
                {
                    const oldValue = currentDescriptor.get?.call(this);

                    if (Object.is(oldValue, value))
                    {
                        currentDescriptor.set!.call(this, value);

                        action(this, currentDescriptor.get?.call(this), value);
                    }
                }
        };
    }
    else
    {
        const privateKey = typeof property == "string" ? `_${property.toString()}` : `${property.description}`;

        propertyDescriptor =
        {
            configurable: true,
            get(this: T & Indexer)
            {
                return this[privateKey];
            },
            set: beforeSetter
                ? function(this: T & Indexer, value: unknown)
                {
                    const oldValue = this[privateKey];

                    if (Object.is(oldValue, value))
                    {
                        action(this, this[privateKey], value);

                        (this as Indexer)[privateKey] = value;
                    }
                }
                : function(this: T & Indexer, value: unknown)
                {
                    const oldValue = this[privateKey];

                    if (Object.is(oldValue, value))
                    {
                        (this as Indexer)[privateKey] = value;

                        action(this, this[privateKey], value);
                    }
                }
        };
    }

    Object.defineProperty(target, property, propertyDescriptor);

    return propertyDescriptor;
}

export function pathfy(source: object, options?: { keySeparator?: string, keyTranform?: Func1<string, string>, valueSeparator?: string }): Array<string>
{
    const { keySeparator = ".", keyTranform = (x: string) => x, valueSeparator = ":" } = options ?? { };

    const result: Array<string> = [];

    for (const [key, value] of Object.entries(source))
    {
        if (value instanceof Object)
        {
            result.push(...pathfy(value, options).map(x => keyTranform(key) + (keySeparator ?? ".") + x));
        }
        else
        {
            result.push(`${keyTranform(key)}${valueSeparator ?? ": "}${value}`);
        }
    }

    return result;
}

// tslint:disable-next-line:no-any
export function proxyFrom<TInstances extends Array<object>>(...instances: TInstances): Combine<TInstances>;
export function proxyFrom(...instances: Array<Indexer>): Indexer
{
    const handler: ProxyHandler<Indexer> =
    {
        get(_, key)
        {
            const instance = instances.find(x => key in x);

            if (instance)
            {
                return instance[key as string];
            }

            return undefined;
        },
        getOwnPropertyDescriptor(_, key)
        {
            for (const instance of instances)
            {
                const descriptor = Object.getOwnPropertyDescriptor(instance, key);

                if (descriptor)
                {
                    descriptor.configurable = true,
                    descriptor.enumerable   = true;

                    return descriptor;
                }
            }

            return undefined;
        },
        has: (_, key) => instances.some(x => key in x),
        ownKeys: (_) => Array.from(new Set(instances.map(x => Object.getOwnPropertyNames(x)).flatMap(x => x))),
        set(_, key, value)
        {
            const instance = instances.find(x => key in x);

            if (instance)
            {
                instance[key as string] = value;
            }
            else
            {
                instances[0][key as string] = value;
            }

            return true;
        },
    };

    return new Proxy(instances[0], handler);
}

/**
 * Performs deep comparision between values.
 * @param left  Left  value
 * @param right Right value
 */
export function structuralEqual(left: unknown, right: unknown): boolean
{
    return left === right || Hashcode.encode(left) == Hashcode.encode(right);
}

export function *enumerateKeys(target: object): IterableIterator<string>
{
    let prototype = target;
    do
    {
        for (const key of Object.getOwnPropertyNames(prototype))
        {
            yield key;
        }
    } while ((prototype = Object.getPrototypeOf(prototype)) && prototype.constructor != Object);
}