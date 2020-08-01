import Hashcode                                                   from "../hashcode";
import { Combine, Constructor, Func1, Indexer, MergeList, Mixer } from "../types";
import { assert, typeGuard }                                      from "./generic";

const PRIVATES = Symbol("core:privates");

function internalDeepMerge(sources: Array<Indexer>, combineArrays: boolean): Indexer
{
    const target: Indexer = { };

    for (const current of sources)
    {
        for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(current)))
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
                    descriptor.value = internalDeepMerge([targetValue, currentValue], combineArrays);

                    Reflect.defineProperty(target, key, { ...descriptor });
                }
                else
                {
                    Reflect.defineProperty(target, key, descriptor);
                }
            }
            else
            {
                Reflect.defineProperty(target, key, descriptor);
            }
        }
    }

    return target;
}

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
        const prototype: Indexer = Object.create(Reflect.getPrototypeOf(source));

        for (const key of Reflect.ownKeys(source) as Array<string|number>)
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

export function deepEqual<T>(left: T, right: T): boolean
{
    if (Object.is(left, right))
    {
        return true;
    }
    else if (typeGuard<Indexer>(left, left instanceof Object) && typeGuard<Indexer>(right, right instanceof left.constructor))
    {
        for (const key of enumerateKeys(left))
        {
            if (!deepEqual(left[key as string], right[key as string]))
            {
                return false;
            }
        }

        return true;
    }

    return false;
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

export function getKeyMember<T extends object>(target: T, path: string|Array<string>): { key: string, member: T };
export function getKeyMember(target: Indexer, path: string|Array<string>): { key: string, member: Indexer }
{
    const [key, ...keys] = Array.isArray(path) ? path : path.split(".");

    if (keys.length > 0)
    {
        if (key in target)
        {
            const member = target[key];

            return getKeyMember(member as Indexer, keys);
        }
        else
        {
            const typeName = target instanceof Function ? target.name : target.constructor.name;
            throw new Error(`Property "${key}" does not exists on type ${typeName}`);
        }
    }

    return { key, member: target };
}

export function getKeyValue<TTarget extends object, TValue = unknown>(target: TTarget, path: string|Array<string>): { key: string, value: TValue };
export function getKeyValue(target: Indexer, path: string|Array<string>): { key: string, value: unknown }
{
    const { key, member } = getKeyMember(target, path);

    return { key, value: member[key] };
}

export function getValue<TTarget extends object, T = unknown>(target: TTarget, path: string|Array<string>): T|undefined
{
    return getKeyValue<TTarget, T>(target, path).value;
}

/**
 * Deeply merges two or more objects.
 * @param sources Objects to merge.
 */
export function deepMerge<TSources extends Array<object>>(...sources: TSources): Combine<TSources>
{
    return internalDeepMerge(sources as Array<Indexer>, false) as Combine<TSources>;
}

/**
 * Deeply merges two or more objects and arrays.
 * @param sources Objects to merge.
 */
export function deepMergeCombine<TSources extends Array<object>>(...sources: TSources): Combine<TSources>
{
    return internalDeepMerge(sources as Array<Indexer>, true) as Combine<TSources>;
}

/**
 * Merges two or more objects.
 * @param sources objects to merge
 * */
export function merge<T extends Array<object>>(...sources: T): MergeList<T>
{
    const target: Indexer = { };

    for (const source of sources)
    {
        for (const key of Reflect.ownKeys(source))
        {
            Reflect.defineProperty(target, key, Reflect.getOwnPropertyDescriptor(source, key)!);
        }
    }

    return target as MergeList<T>;
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

/**
 * Inject an action to be executed after instantiation.
 * @param constructor target constructor
 * @param action action to be executed
 */
export function overrideConstructor<T extends Constructor>(constructor: T, action: Func1<InstanceType<T>, InstanceType<T>>): T
{
    const proxy =
    {
        [constructor.name]: function(...args: Array<unknown>)
        {
            const instance = Reflect.construct(constructor, args, new.target) as InstanceType<T>;

            return action(instance);
        }
    }[constructor.name];

    Reflect.setPrototypeOf(proxy, Reflect.getPrototypeOf(constructor));
    Object.defineProperties(proxy, Object.getOwnPropertyDescriptors(constructor));

    proxy.prototype.constructor = proxy;

    return proxy as unknown as T;
}

export function overrideProperty<T extends object>(target: T & { [PRIVATES]?: Indexer }, property: string|symbol, action: (instance: T, newValue: unknown, oldValue: unknown) => void, descriptor?: PropertyDescriptor|null, beforeSetter?: boolean): PropertyDescriptor
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

                    if (!Object.is(oldValue, value))
                    {
                        action(this, oldValue, value);

                        currentDescriptor.set!.call(this, value);
                    }

                }
                : function(this: T, value: unknown)
                {
                    const oldValue = currentDescriptor.get?.call(this);

                    if (!Object.is(oldValue, value))
                    {
                        currentDescriptor.set!.call(this, value);

                        action(this, oldValue, value);
                    }
                }
        };
    }
    else
    {
        const privates = target[PRIVATES] = target[PRIVATES] ?? { };

        privates[property as string] = target[property as keyof T];

        propertyDescriptor =
        {
            configurable: true,
            get(this: T & Indexer)
            {
                return privates[property as string];
            },
            set: beforeSetter
                ? function(this: T & Indexer, value: unknown)
                {
                    const oldValue = privates[property as string];

                    if (!Object.is(oldValue, value))
                    {
                        action(this, oldValue, value);

                        privates[property as string] = value;
                    }
                }
                : function(this: T & Indexer, value: unknown)
                {
                    const oldValue = privates[property as string];

                    if (!Object.is(oldValue, value))
                    {
                        privates[property as string] = value;

                        action(this, oldValue, value);
                    }
                }
        };
    }

    Reflect.defineProperty(target, property, propertyDescriptor);

    return propertyDescriptor;
}

export function pathfy(source: object, options?: { keySeparator?: string, keyTranform?: Func1<string, string>, valueSeparator?: string }): Array<string>
{
    const { keySeparator = ".", keyTranform = (x: string) => x, valueSeparator = ": " } = options ?? { };

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

export function *enumerateKeys(target: object): IterableIterator<string|number|symbol>
{
    let prototype = target;
    do
    {
        for (const key of Reflect.ownKeys(prototype))
        {
            yield key;
        }
    } while ((prototype = Reflect.getPrototypeOf(prototype)) && prototype.constructor != Object);
}