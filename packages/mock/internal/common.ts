import { deepEqual } from "@surface/core";

const IT = Symbol("mock:it");

type ItFunction<T = unknown> = ((value: T) => boolean) & { [IT]?: { name: string, args: unknown[] } };

export { IT };

export function checkIt(it: unknown, value: unknown): boolean
{
    if (isIt(it))
    {
        return it(value);
    }

    return false;
}

export function isIt(it: unknown): it is ItFunction
{
    return typeof it == "function" && !!(it as { [IT]?: boolean })[IT];
}

export function makeIt<T>(name: string, args: unknown[], fn: ItFunction<T>): T
{
    fn[IT] = { name, args };

    return fn as unknown as T;
}

export function sameIt(left: unknown, right: unknown): boolean
{
    return isIt(left) && isIt(right) && deepEqual(left[IT], right[IT]);
}
