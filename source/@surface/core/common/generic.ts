import { Func1, Nullable } from "../";

export function coalesce<T>(value: Nullable<T>, fallback: T): T
{
    return value !== null && value !== undefined ? value : fallback;
}

export function typeGuard<T, U extends T>(target: T, predicate: Func1<T, boolean>): target is U
{
    return predicate(target);
}