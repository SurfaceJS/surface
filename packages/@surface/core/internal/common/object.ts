/* eslint-disable @typescript-eslint/indent */
/* eslint-disable import/exports-last */
/* eslint-disable max-depth */
import type
{
    ArrayPathOf,
    ArrayPathOfValue,
    Cast,
    Constructor,
    Delegate,
    Indexer,
    Intersect,
    Mixer,
} from "../types";
import type MergeRule        from "../types/merge-rule";
import type MergeRules       from "../types/merge-rules";
import { assert, typeGuard } from "./generic.js";

const PRIVATES = Symbol("core:privates");

type Value = string | boolean | number | Object;

function applyRule(left: unknown, right: unknown, rule?: MergeRule<Value>): unknown
{
    if (rule)
    {
        if (rule == "protected")
        {
            return left;
        }
        else if (typeof rule == "function")
        {
            return rule(left as Value, right as Value);
        }
        else if (left instanceof Object)
        {
            if (Array.isArray(left) && Array.isArray(right))
            {
                return mergeArray(left, right, rule);
            }
            else if (rule == "merge" && right instanceof Object)
            {
                return { ...left, ...right };
            }
            else if (rule instanceof Object && right instanceof Object)
            {
                return merge([left, right], rule);
            }
        }
    }

    return right;
}

function match(left: unknown, right: unknown): boolean
{
    return left instanceof RegExp && right instanceof RegExp
        ? left.source == right.source
        : Object.is(left, right);
}

function mergeArray(left: unknown[], right: unknown[], rule: MergeRule<Value | Value[]>): unknown[]
{
    if (Array.isArray(rule))
    {
        const result = [...left];

        const matches = Object.entries(rule)
            .filter(([_, value]) => value == "match")
            .every(([key]) => match((left as Indexer)[key], (right as Indexer)[key]));

        if (matches)
        {
            for (const index of Object.keys(right))
            {
                const itemRule = rule[index as unknown as number] as MergeRule<Value> | undefined;

                const leftItem  = left[index as keyof []];
                const rightItem = right[index as keyof []];

                result[index as unknown as number] = applyRule(leftItem, rightItem, itemRule);
            }
        }

        return result;
    }
    else if (rule == "...merge" || rule instanceof Object)
    {
        const result = [...left];

        for (const index of Object.keys(right))
        {
            const leftItem  = left[index as unknown as number];
            const rightItem = right[index as unknown as number];

            result[index as unknown as number] =
                rule instanceof Object && leftItem instanceof Object && rightItem instanceof Object
                    ? merge([leftItem, rightItem], rule as MergeRules<object>)
                    : rule == "...merge" && leftItem instanceof Object && rightItem instanceof Object
                        ? { ...leftItem, ...rightItem }
                        : rightItem;
        }

        return result;
    }

    switch (rule)
    {
        case "prepend":
            return right.concat(left);
        case "append":
            return left.concat(right);
        case "merge":
        default:
            return Object.values({ ...left, ...right });
    }
}

export enum DeepMergeFlags
{
    IgnoreUndefined = 0x1,
    ConcatArrays    = 0x2,
    MergeArrays     = 0x4,
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

/**
 * Deeply merges two or more objects.
 * @param sources Objects to merge.
 */
export function deepMerge<TSources extends object[]>(sources: TSources, flags: DeepMergeFlags = 0): Intersect<TSources>
{
    const result: Indexer = { };

    for (const current of sources)
    {
        for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(current)))
        {
            const leftValue  = result[key];
            const rightValue = (current as Indexer)[key];

            let resultDescriptor = descriptor;

            if (leftValue instanceof Object)
            {
                if (Array.isArray(leftValue) && Array.isArray(rightValue))
                {
                    if (hasFlags(flags, DeepMergeFlags.ConcatArrays))
                    {
                        resultDescriptor = { ...descriptor, value: [...leftValue, ...rightValue] };
                    }
                    else if (hasFlags(flags, DeepMergeFlags.MergeArrays))
                    {
                        const elements = [...leftValue];

                        for (const [index, rightItem] of Object.entries(rightValue))
                        {
                            const leftItem = elements[index as keyof unknown[]];

                            elements[index as keyof unknown[]] = leftItem instanceof Object && rightItem instanceof Object
                                ? deepMerge([leftItem, rightItem], flags)
                                : rightItem;
                        }

                        resultDescriptor = { ...descriptor, value: elements };
                    }
                }
                else if (rightValue instanceof Object)
                {
                    const value = deepMerge([leftValue, rightValue], flags);

                    resultDescriptor = { ...descriptor, value };
                }
            }
            else if (hasFlags(flags, DeepMergeFlags.IgnoreUndefined) && rightValue instanceof Object && !Array.isArray(rightValue))
            {
                const value = deepMerge([rightValue], flags);

                resultDescriptor = { ...descriptor, value };
            }

            if (!(hasFlags(flags, DeepMergeFlags.IgnoreUndefined) && Object.is(rightValue, undefined)))
            {
                Reflect.defineProperty(result, key, resultDescriptor);
            }
        }
    }

    return result as Intersect<TSources>;
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

export function isEsm(module: unknown): module is object
{
    return typeof module == "object" && module !== null && (!!Reflect.get(module, "__esModule") || Reflect.get(module as Object, Symbol.toStringTag) == "Module");
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

/**
 * Merges two or more objects using optional rules.
 * @param sources objects to merge
 * @param rules   rules used to control merge
 * */

export function hasFlags<T extends number>(value: T, flags: T): boolean
{
    return (value & flags) == flags;
}

export function merge<TSources extends [object, ...object[]]>(sources: TSources, rules: MergeRules<Cast<Intersect<TSources>, object>> = { }): Intersect<TSources>
{
    const [first, ...remaining] = sources;

    const result: Indexer = { ...first };

    const matchKeys = Object.entries(rules).filter(x => x[1] == "match").map(x => x[0]);

    for (const current of remaining)
    {
        const hasMatch = matchKeys
            .every(key => match(result[key], (current as Indexer)[key]));

        if (hasMatch)
        {
            for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(current)))
            {
                const leftValue  = (result as Indexer)[key];
                const rightValue = (current as Indexer)[key];
                const rule       = (rules as Indexer)[key] as MergeRule<Value> | undefined;

                if (rule != "protected")
                {
                    Reflect.defineProperty(result, key, { ...descriptor, value: applyRule(leftValue, rightValue, rule) });
                }
            }
        }
    }

    return result as Intersect<TSources>;
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

export function proxyFrom<TInstances extends object[]>(...instances: TInstances): Intersect<TInstances>;
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

export function *enumerateKeys(target: object): IterableIterator<PropertyKey>
{
    const set = new Set<PropertyKey>();

    let prototype: object | null = target;

    do
    {
        for (const key of Reflect.ownKeys(prototype))
        {
            if (!set.has(key))
            {
                set.add(key);

                yield key;
            }
        }
    } while ((prototype = Reflect.getPrototypeOf(prototype)) && prototype.constructor != Object);
}