import { Nullable } from "../";

export function coalesce<T>(value: Nullable<T>, fallback: T): T
{
    return value !== null && value !== undefined ? value : fallback;
}