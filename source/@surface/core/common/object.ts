import { ObjectLiteral } from "..";

export function clone<T extends ObjectLiteral>(source: T): T
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
        const prototype: ObjectLiteral = Object.create(Object.getPrototypeOf(source));
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

/**
 * Deeply merges two or more objects.
 * @param target Object to receive merge.
 * @param source Objects to merge to the target.
 */
export function merge<TTarget extends ObjectLiteral, TSource extends ObjectLiteral>(target: TTarget, source: Array<TSource>): TTarget & TSource;
/**
 * Deeply merges two or more objects, and optionally concatenate array values.
 * @param target        Object to receive merge.
 * @param source        Object to merge to the target.
 * @param combineArrays Specify to combine or not arrays.
 */
export function merge<TTarget extends ObjectLiteral, TSource extends ObjectLiteral>(target: TTarget, source: Array<TSource>, combineArrays: boolean): TTarget & TSource;
/**
 * Deeply merges two objects.
 * @param target Object to receive merge.
 * @param source Objects to merge to the target.
 */
export function merge<TTarget extends ObjectLiteral, TSource extends ObjectLiteral>(target: TTarget, source: TSource): TTarget & TSource;
/**
 * Deeply merges two objects, and optionally concatenate array values.
 * @param target Object to receive merge.
 * @param source Object to merge to the target.
 * @param combineArrays
 */
export function merge<TTarget extends ObjectLiteral, TSource extends ObjectLiteral>(target: TTarget, source: TSource, combineArrays: boolean): TTarget & TSource;
export function merge<TTarget extends ObjectLiteral, TSource extends ObjectLiteral>(target: TTarget, source: TSource|Array<TSource>, combineArrays?: boolean): TTarget & TSource
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

export function objectFactory(keys: Array<[string, unknown]>, target?: ObjectLiteral): object
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