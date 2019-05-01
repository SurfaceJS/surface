import { Constructor, Indexer } from "..";
import Hashcode                 from "../hashcode";

export function clone<T extends Indexer>(source: T): T
{
    if (Array.isArray(source))
    {
        const values = [];
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

        return values as object as T;
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
        return prototype as T;
    }
}

// tslint:disable-next-line:cyclomatic-complexity
export function destruct(expression: string, source: Indexer|Array<unknown>): Indexer
{
    const result: Indexer = { };
    const arrayPattern    = /\[([^\[\]}]*)\]/;
    const objectPattern   = /\{([^\{\}}]*)\}/;

    if (arrayPattern.test(expression))
    {
        if (Array.isArray(source))
        {
            let index = 0;

            const keys = arrayPattern.exec(expression)![1].split(",").map(pairs => pairs.split(":").map(keys => keys.trim()));

            for (const [key, alias] of keys)
            {
                if (index == keys.length - 1 && key.startsWith("..."))
                {
                    result[(alias || key).replace("...", "")] = source.slice(index);
                }
                else
                {
                    result[alias || key] = source[index];
                }

                index++;
            }

            return result;
        }
        else
        {
            throw new Error();
        }
    }
    else if (objectPattern.test(expression))
    {
        if (!Array.isArray(source))
        {
            let index = 0;

            const keys = objectPattern.exec(expression)![1].split(",").map(pairs => pairs.split(":").map(keys => keys.trim()));

            for (const [key, alias] of keys)
            {
                if (index == keys.length - 1 && key.startsWith("..."))
                {
                    let rest: Indexer = { };

                    for (const [key, value] of Object.entries(source).filter(([sourceKey]) => !keys.some(([key]) => key == sourceKey)))
                    {
                        rest[key] = value;
                    }

                    result[(alias || key).replace("...", "")] = rest;
                }
                else
                {
                    result[alias || key] = source[key];
                }

                index++;
            }

            return result;
        }
    }

    throw new Error("Invalid expression");
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

export function getKeyMember(target: Indexer, path: string): [string, Indexer]
{
    if (path.includes("."))
    {
        const [key, ...keys] = path.split(".");

        if (key in target)
        {
            const member = target[key];

            if (member instanceof Object)
            {
                return getKeyMember(member, keys.join("."));
            }
        }
        else
        {
            const typeName = target instanceof Function ? target.name : target.constructor.name;
            throw new Error(`Member ${key} does not exist in type ${typeName}`);
        }
    }

    return [path, target];
}

export function getKeyValue<T = unknown>(target: Indexer, path: string): [string, T]
{
    const [key, member] = getKeyMember(target, path);

    return [key, member[key] as T];
}

export function getValue<T = unknown>(target: Indexer, path: string): T
{
    return getKeyValue<T>(target, path)[1];
}

/**
 * Deeply merges two or more objects.
 * @param target Object to receive merge.
 * @param source Objects to merge to the target.
 */
export function merge<TTarget extends Indexer, TSource extends Indexer>(target: TTarget, source: Array<TSource>): TTarget & TSource;
/**
 * Deeply merges two or more objects, and optionally concatenate array values.
 * @param target        Object to receive merge.
 * @param source        Object to merge to the target.
 * @param combineArrays Specify to combine or not arrays.
 */
export function merge<TTarget extends Indexer, TSource extends Indexer>(target: TTarget, source: Array<TSource>, combineArrays: boolean): TTarget & TSource;
/**
 * Deeply merges two objects.
 * @param target Object to receive merge.
 * @param source Objects to merge to the target.
 */
export function merge<TTarget extends Indexer, TSource extends Indexer>(target: TTarget, source: TSource): TTarget & TSource;
/**
 * Deeply merges two objects, and optionally concatenate array values.
 * @param target Object to receive merge.
 * @param source Object to merge to the target.
 * @param combineArrays
 */
export function merge<TTarget extends Indexer, TSource extends Indexer>(target: TTarget, source: TSource, combineArrays: boolean): TTarget & TSource;
export function merge<TTarget extends Indexer, TSource extends Indexer>(target: TTarget, source: TSource|Array<TSource>, combineArrays?: boolean): TTarget & TSource
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
            const targetValue  = target[key];
            const currentValue = current[key];

            if (targetValue instanceof Object)
            {
                if (Array.isArray(targetValue) && Array.isArray(currentValue) && combineArrays)
                {
                    target[key] = targetValue.concat(currentValue);
                }
                else if (currentValue instanceof Object)
                {
                    target[key] = merge(targetValue, currentValue, combineArrays);
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

    return target as TTarget & TSource;
}

export function mixin<TBase extends Constructor, TConstructors extends Constructor>(first: TBase, second: TConstructors): TBase & TConstructors
{
    const name = `${first.name}${second.name}Mixin`;

    const proxy = { [name]: function() { /* proxy */ }}[name];

    Object.setPrototypeOf(proxy, Object.assign(Object.getPrototypeOf(first), Object.getPrototypeOf(second)));
    Object.defineProperties(proxy, Object.assign(Object.getOwnPropertyDescriptors(first), Object.getOwnPropertyDescriptors(second)));

    return proxy as unknown as TBase & TConstructors;
}

/**
 * Create an object using the provided keys.
 * @param keys   Object keys
 * @param target If provided, all keys will inserted on target object
 */
export function objectFactory(keys: Array<[string, unknown]>, target?: Indexer): object
{
    target = target || { };
    for (const entries of keys)
    {
        const [key, value] = entries;
        if (key.includes("."))
        {
            const [name, ...rest] = key.split(".");
            target[name] = objectFactory([[rest.join("."), value]], target[name] as object);
        }
        else
        {
            target[key] = value;
        }
    }
    return target;
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