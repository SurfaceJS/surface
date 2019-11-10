import { Func1, Nullable } from "../";

export function assert(condition: unknown, message?: string): asserts condition
{
    if (!condition)
    {
        throw new Error(message);
    }
}

export function hasValue(value: unknown): value is Object;
export function hasValue<T>(value: Nullable<T>): value is NonNullable<T>
{
    return value !== null && value !== undefined;
}

export function isIterable(source: { [Symbol.iterator]?: Function }): source is Iterable<unknown>;
export function isIterable<T>(source: { [Symbol.iterator]?: Function }): source is Iterable<T>;
export function isIterable(source: { [Symbol.iterator]?: Function }): source is Iterable<unknown>
{
    return typeof source[Symbol.iterator] == "function";
}

// tslint:disable-next-line:no-any
export function tuple<Targs extends Array<any>>(...args: Targs): Targs
{
    return args;
}

export function typeGuard<T, U extends T>(target: T, predicate: Func1<T, boolean>): target is U;
export function typeGuard<T>(target: unknown, predicate: Func1<unknown, boolean>): target is T;
export function typeGuard(target: unknown, predicate: Func1<unknown, boolean>): boolean
{
    return predicate(target);
}