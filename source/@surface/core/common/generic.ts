import { Func1, Nullable } from "../";

export function coalesce<T, U extends T>(value: Nullable<T>, fallback: U): T;
export function coalesce<T>(value: Nullable<T>, fallback: T): T;
export function coalesce<T>(value: Nullable<T>, fallback: T): T
{
    return value !== null && value !== undefined ? value : fallback;
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

export function typeGuard<T, U extends T>(target: T, predicate: Func1<T, boolean>): target is U
{
    return predicate(target);
}