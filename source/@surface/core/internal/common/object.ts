import { ArrayPathOf, ArrayPathOfValue, Combine, Constructor, Delegate, Indexer, MergeList, Mixer } from "../types";
import { assert, typeGuard }                                                                        from "./generic";

const PRIVATES = Symbol("core:privates");

function internalDeepMerge(sources: Indexer[], combineArrays: boolean): Indexer
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
                    Reflect.defineProperty(target, key, { ...descriptor, value: [...targetValue, ...currentValue] });
                }
                else if (typeGuard<Indexer>(currentValue, currentValue instanceof Object))
                {
                    const value = internalDeepMerge([targetValue, currentValue], combineArrays);

                    Reflect.defineProperty(target, key, { ...descriptor, value });
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
        const values: unknown[] = [];

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

    const prototype: Indexer = Object.create(Reflect.getPrototypeOf(source));

    for (const key of Reflect.ownKeys(source) as (string | number)[])
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

export function getValue<T extends object, P extends ArrayPathOf<T, P>>(target: T, ...path: P): ArrayPathOfValue<T, P>;
export function getValue(root: object, ...path: string[]): unknown
{
    const [key, ...keys] = path;

    if (keys.length > 0)
    {
        if (key in root)
        {
            return getValue((root as Indexer)[key] as object, ...keys);
        }

        const typeName = root instanceof Function ? root.name : root.constructor.name;

        throw new Error(`Property "${key}" does not exists on type ${typeName}`);
    }

    return (root as Indexer)[key];
}

export function setValue<T extends object, P extends ArrayPathOf<T, P>>(value: ArrayPathOfValue<T, P>, root: T, ...path: P): void;
export function setValue(value: unknown, root: object, ...path: string[]): void
{
    const key = path[path.length - 1];

    if (path.length - 1 > 0)
    {
        const property = getValue(root, ...path.slice(0, path.length - 1));

        (property as Indexer)[key] = value;
    }
    else
    {
        (root as Indexer)[key] = value;
    }
}

/**
 * Deeply merges two or more objects.
 * @param sources Objects to merge.
 */
export function deepMerge<TSources extends object[]>(...sources: TSources): Combine<TSources>
{
    return internalDeepMerge(sources as Indexer[], false) as Combine<TSources>;
}

/**
 * Deeply merges two or more objects and arrays.
 * @param sources Objects to merge.
 */
export function deepMergeCombine<TSources extends object[]>(...sources: TSources): Combine<TSources>
{
    return internalDeepMerge(sources as Indexer[], true) as Combine<TSources>;
}

/**
 * Merges two or more objects.
 * @param sources objects to merge
 * */
export function merge<T extends object[]>(...sources: T): MergeList<T>
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

export function mixer<TConstructor extends Constructor, TMixins extends ((superClass: TConstructor) => Constructor)[], TMixer extends Mixer<TConstructor, TMixins>>(constructor: TConstructor, mixins: TMixins): TMixer
{
    assert(mixins.length > 0, "Mixer requires at least one mixin");

    const mixin = mixins.pop()!;

    const $class = mixin(constructor);

    if (mixins.length > 0)
    {
        return mixer($class as TConstructor, mixins);
    }

    return $class as TMixer;
}

/**
 * Create an object using the provided keys.
 * @param keys   Object keys
 * @param target If provided, all keys will inserted on target object
 */
export function objectFactory(keys: [string, unknown][], target: Indexer = { }): object
{
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

export function pathfy(source: object, options?: { keySeparator?: string, keyTranform?: Delegate<[string], string>, valueSeparator?: string }): string[]
{
    const { keySeparator = ".", keyTranform = (x: string) => x, valueSeparator = ": " } = options ?? { };

    const result: string[] = [];

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

export function privatesFrom<T extends { [PRIVATES]?: Indexer }>(target: T): Indexer
{
    if (!target[PRIVATES])
    {
        Object.defineProperty(target, PRIVATES, { configurable: true, enumerable: false, value: { }, writable: false });
    }

    return target[PRIVATES]!;
}

export function proxyFrom<TInstances extends object[]>(...instances: TInstances): Combine<TInstances>;
export function proxyFrom(...instances: Indexer[]): Indexer
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
                const descriptor = Reflect.getOwnPropertyDescriptor(instance, key);

                if (descriptor)
                {
                    descriptor.configurable = true,
                    descriptor.enumerable   = true;

                    return descriptor;
                }
            }

            return undefined;
        },
        has:     (_, key) => instances.some(x => key in x),
        ownKeys: () => Array.from(new Set(instances.map(x => Object.getOwnPropertyNames(x)).flatMap(x => x))),
        set      (_, key, value)
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

export function *enumerateKeys(target: object): IterableIterator<string | number | symbol>
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