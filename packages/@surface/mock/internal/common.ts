import { Hashcode } from "@surface/core";

export const IT = Symbol("mock:it");

export function isIt(it: unknown): it is (value: unknown) => boolean
{
    return typeof it == "function" && !!(it as { [IT]?: boolean })[IT];
}

export function makeIt<T>(fn: Function & { [IT]?: boolean }): T
{
    fn[IT] = true;
    return fn as unknown as T;
}

export function equals(left: unknown, right: unknown): boolean
{
    return Object.is(left, right) || typeof left == typeof right && Hashcode.encode(left) == Hashcode.encode(right);
}