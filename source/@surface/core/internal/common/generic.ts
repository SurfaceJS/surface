import { Nullable } from "../types";

export function assert(condition: unknown, message?: string): asserts condition
{
    if (!condition)
    {
        throw new Error(message);
    }
}

export function assertGet<T>(value: Nullable<T>, message?: string): T
{
    if (!hasValue(value))
    {
        throw new Error(message);
    }

    return value;
}

export function hasFlag<T extends number>(value: T, flag: T): boolean
{
    return (value & flag) == flag;
}

export function hasValue(value: unknown): value is Object;
export function hasValue<T>(value: Nullable<T>): value is NonNullable<T>
{
    return value !== null && value !== undefined;
}

export function isIterable(source: object): source is Iterable<unknown>;
export function isIterable<T>(source: object): source is Iterable<T>;
export function isIterable(source: { [Symbol.iterator]?: Function }): source is Iterable<unknown>
{
    return typeof source[Symbol.iterator] == "function";
}

// tslint:disable-next-line:no-any
export function tuple<TArgs extends Array<any>>(...args: TArgs): TArgs
{
    return args;
}


export function typeGuard<T>(target: unknown, condition: boolean): target is T
{
    return condition;
}