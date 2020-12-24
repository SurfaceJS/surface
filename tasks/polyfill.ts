/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/promise-function-async */
/* eslint-disable object-shorthand */
/* eslint-disable func-name-matching */
/* eslint-disable no-extend-native */

import type { Indexer } from "@surface/core";

if (!Array.prototype.flat)
{
    Object.defineProperty
    (
        Array.prototype,
        "flat",
        {
            configurable: true,
            value:        function flat<T>(this: T[], depth: number = 1): T[]
            {
                return depth
                    ? this.reduce<T[]>
                    (
                        (previous, current) =>
                        {
                            if (Array.isArray(current))
                            {
                                previous.push(...current.flat(depth - 1));
                            }
                            else
                            {
                                previous.push(current);
                            }

                            return previous;
                        },
                        [],
                    )
                    : this.slice();
            },
            writable: true,
        },
    );
}

if (!Array.prototype.flatMap)
{
    Object.defineProperty
    (
        Array.prototype,
        "flatMap",
        {
            configurable: true,
            value:        function flatMap<T, U>(this: T[], callback: (value: T, index: number, array: T[]) => U | readonly U[]): U[]
            {
                return this.map(callback).flat() as U[];
            },
            writable: true,
        },
    );
}

if (!Object.fromEntries)
{
    Object.defineProperty
    (
        Object.prototype,
        "fromEntries",
        {
            configurable: true,
            value:        function fromEntries(entries: Iterable<readonly [PropertyKey, unknown]>): any
            {
                const result: Indexer = { };

                for (const [key, value] of entries)
                {
                    Object.defineProperty
                    (
                        result,
                        key,
                        {
                            configurable: true,
                            enumerable:   true,
                            value,
                            writable:     true,
                        },
                    );
                }

                return result;
            },
            writable: true,
        },
    );
}

if (!Promise.prototype.finally)
{

    Object.defineProperty
    (
        Promise.prototype,
        "finally",
        {
            configurable: true,
            value:
            {
                finally: async function <T>(this: Promise<T>, onfinally?: (() => void) | undefined | null): Promise<void>
                {
                    return this.then(onfinally, onfinally);
                },
            }.finally,
            writable: true,
        },
    );
}