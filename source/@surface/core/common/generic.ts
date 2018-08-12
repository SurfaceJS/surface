import { Func1, Nullable } from "../";

export function coalesce<T>(value: unknown, fallback: T): T
{
    return value !== null && value !== undefined ? value as T : fallback;
}

export function hasValue<T>(value: Nullable<T>): value is NonNullable<T>
{
    return value !== null && value !== undefined;
}

export function typeGuard<T, U extends T>(target: T, predicate: Func1<T, boolean>): target is U
{
    return predicate(target);
}