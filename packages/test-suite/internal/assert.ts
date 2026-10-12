import { deepStrictEqual, doesNotMatch, fail, match } from "node:assert";

type Constructor = Function;

interface AssertionError extends Error
{
    actual?: unknown;
    expected?: unknown;
    operator?: string;
}

function makeError(message: string | undefined, actual: unknown, expected: unknown, operator: string): AssertionError
{
    const error = new Error(message ?? `${actual} ${operator} ${expected}`) as AssertionError;
    error.actual   = actual;
    error.expected = expected;
    error.operator = operator;
    return error;
}

function stringify(value: unknown): string
{
    if (value == null)
    {
        return String(value);
    }

    try
    {
        return JSON.stringify(value);
    }
    catch
    {
        return String(value);
    }
}

function isDeepEqual(actual: unknown, expected: unknown): boolean
{
    try
    {
        deepStrictEqual(actual, expected);

        return true;
    }
    catch
    {
        return false;
    }
}

function toPredicate(actual: unknown, expected: unknown, message: string | undefined, negate: boolean, operator: string): void
{
    const passed = negate ? !isDeepEqual(actual, expected) : isDeepEqual(actual, expected);

    if (!passed)
    {
        throw makeError(message, actual, expected, negate ? `!${operator}` : operator);
    }
}

async function inspectPromise(promise: Promise<unknown>, message: string | undefined, expectFulfilled: boolean): Promise<void>
{
    let settled: "fulfilled" | "rejected" = "fulfilled";
    let value:  unknown                  = undefined;

    try
    {
        value = await promise;
    }
    catch (error)
    {
        settled = "rejected";
        value   = error;
    }

    if (expectFulfilled && settled != "fulfilled")
    {
        const error = makeError(message, value, "fulfilled", "isFulfilled");

        throw error;
    }

    if (!expectFulfilled && settled != "rejected")
    {
        throw makeError(message, value, "rejected", "isRejected");
    }
}

const assert =
{
    ok: (value: unknown, message?: string): void =>
    {
        if (!value)
        {
            throw makeError(message, value, "truthy", "ok");
        }
    },
    equal: (actual: unknown, expected: unknown, message?: string): void =>
    {
        if (actual != expected)
        {
            throw makeError(message, actual, expected, "==");
        }
    },

    notEqual: (actual: unknown, expected: unknown, message?: string): void =>
    {
        if (actual == expected)
        {
            throw makeError(message, actual, expected, "!=");
        }
    },

    strictEqual: (actual: unknown, expected: unknown, message?: string): void =>
    {
        if (actual !== expected)
        {
            throw makeError(message, actual, expected, "===");
        }
    },

    notStrictEqual: (actual: unknown, expected: unknown, message?: string): void =>
    {
        if (actual === expected)
        {
            throw makeError(message, actual, expected, "!==");
        }
    },

    deepEqual: (actual: unknown, expected: unknown, message?: string): void =>
    {
        toPredicate(actual, expected, message, false, "deepEqual");
    },

    notDeepEqual: (actual: unknown, expected: unknown, message?: string): void =>
    {
        toPredicate(actual, expected, message, true, "notDeepEqual");
    },

    deepStrictEqual: (actual: unknown, expected: unknown, message?: string): void =>
    {
        try
        {
            deepStrictEqual(actual, expected, message);
        }
        catch (error)
        {
            throw normalize(error, actual, expected, "deepStrictEqual");
        }
    },

    notDeepStrictEqual: (actual: unknown, expected: unknown, message?: string): void =>
    {
        try
        {
            if (isDeepEqual(actual, expected))
            {
                throw makeError(message, actual, expected, "!deepStrictEqual");
            }
        }
        catch (error)
        {
            if (error instanceof Error && !(error as AssertionError).operator)
            {
                throw error;
            }

            throw normalize(error, actual, expected, "!deepStrictEqual");
        }
    },

    isTrue: (value: unknown, message?: string): void =>
    {
        if (value !== true)
        {
            throw makeError(message, value, true, "isTrue");
        }
    },

    isFalse: (value: unknown, message?: string): void =>
    {
        if (value !== false)
        {
            throw makeError(message, value, false, "isFalse");
        }
    },

    isOk: (value: unknown, message?: string): void =>
    {
        if (!value)
        {
            throw makeError(message, value, "truthy", "isOk");
        }
    },

    isNotOk: (value: unknown, message?: string): void =>
    {
        if (Boolean(value))
        {
            throw makeError(message, value, "falsy", "isNotOk");
        }
    },

    isNull: (value: unknown, message?: string): void =>
    {
        if (value !== null)
        {
            throw makeError(message, value, null, "isNull");
        }
    },

    isNotNull: (value: unknown, message?: string): void =>
    {
        if (value === null)
        {
            throw makeError(message, value, "!null", "isNotNull");
        }
    },

    isNaN: (value: unknown, message?: string): void =>
    {
        if (!Number.isNaN(value as number))
        {
            throw makeError(message, value, NaN, "isNaN");
        }
    },

    isNotNaN: (value: unknown, message?: string): void =>
    {
        if (Number.isNaN(value as number))
        {
            throw makeError(message, value, "!NaN", "isNotNaN");
        }
    },

    isUndefined: (value: unknown, message?: string): void =>
    {
        if (value !== undefined)
        {
            throw makeError(message, value, undefined, "isUndefined");
        }
    },

    isDefined: (value: unknown, message?: string): void =>
    {
        if (value === undefined)
        {
            throw makeError(message, value, "defined", "isDefined");
        }
    },

    isEmpty: (value: unknown, message?: string): void =>
    {
        if (!isEmptyValue(value))
        {
            throw makeError(message, value, "empty", "isEmpty");
        }
    },

    isNotEmpty: (value: unknown, message?: string): void =>
    {
        if (isEmptyValue(value))
        {
            throw makeError(message, value, "notEmpty", "isNotEmpty");
        }
    },

    isAbove: (value: number, threshold: number, message?: string): void =>
    {
        if (!(value > threshold))
        {
            throw makeError(message, value, `> ${threshold}`, "isAbove");
        }
    },

    isBelow: (value: number, threshold: number, message?: string): void =>
    {
        if (!(value < threshold))
        {
            throw makeError(message, value, `< ${threshold}`, "isBelow");
        }
    },

    isAtLeast: (value: number, threshold: number, message?: string): void =>
    {
        if (!(value >= threshold))
        {
            throw makeError(message, value, `>= ${threshold}`, "isAtLeast");
        }
    },

    isAtMost: (value: number, threshold: number, message?: string): void =>
    {
        if (!(value <= threshold))
        {
            throw makeError(message, value, `<= ${threshold}`, "isAtMost");
        }
    },

    instanceOf: (value: unknown, constructor: Constructor, message?: string): void =>
    {
        if (!(value instanceof constructor))
        {
            throw makeError(message, value, `instance of ${constructor.name}`, "instanceOf");
        }
    },

    notInstanceOf: (value: unknown, constructor: Constructor, message?: string): void =>
    {
        if (value instanceof constructor)
        {
            throw makeError(message, value, `not instance of ${constructor.name}`, "notInstanceOf");
        }
    },

    include: (haystack: unknown, needle: unknown, message?: string): void =>
    {
        if (!includes(haystack, needle))
        {
            throw makeError(message, haystack, `include ${stringify(needle)}`, "include");
        }
    },

    notInclude: (haystack: unknown, needle: unknown, message?: string): void =>
    {
        if (includes(haystack, needle))
        {
            throw makeError(message, haystack, `not include ${stringify(needle)}`, "notInclude");
        }
    },

    matches: (string: string, regexp: RegExp, message?: string): void =>
    {
        try
        {
            match(string, regexp, message);
        }
        catch (error)
        {
            throw normalize(error, string, regexp, "matches");
        }
    },

    doesNotMatch: (string: string, regexp: RegExp, message?: string): void =>
    {
        try
        {
            doesNotMatch(string, regexp, message);
        }
        catch (error)
        {
            throw normalize(error, string, regexp, "doesNotMatch");
        }
    },

    throws: (fn: () => unknown, expected?: unknown, message?: string): Error =>
    {
        const error = runAndCatch(fn);

        if (error == null)
        {
            throw makeError(message, undefined, "throws", "throws");
        }

        if (expected != undefined && !satisfiesExpectation(error, expected))
        {
            throw makeError(message, error, expected, "throws");
        }

        return error;
    },

    throw: (fn: () => unknown, expected?: unknown, message?: string): Error =>
    {
        return assert.throws(fn, expected, message);
    },

    doesNotThrow: (fn: () => unknown, message?: string): void =>
    {
        const error = runAndCatch(fn);

        if (error != null)
        {
            throw makeError(message, error, "doesNotThrow", "doesNotThrow");
        }
    },

    reject: async (promise: Promise<unknown>, expected?: unknown, message?: string): Promise<void> =>
    {
        await inspectPromise(promise, message, false);

        if (expected != undefined)
        {
            const reason = await getReason(promise);

            if (!satisfiesExpectation(reason, expected))
            {
                throw makeError(message, reason, expected, "reject");
            }
        }
    },

    rejects: async (promise: Promise<unknown>, expected?: unknown, message?: string): Promise<void> =>
    {
        return assert.reject(promise, expected, message);
    },

    doesNotReject: async (promise: Promise<unknown>, message?: string): Promise<void> =>
    {
        await inspectPromise(promise, message, true);
    },

    isFulfilled: async (promise: Promise<unknown>, message?: string): Promise<void> =>
    {
        await inspectPromise(promise, message, true);
    },

    isRejected: async (promise: Promise<unknown>, expected?: unknown, message?: string): Promise<void> =>
    {
        await inspectPromise(promise, message, false);

        if (expected != undefined)
        {
            const reason = await getReason(promise);

            if (!satisfiesExpectation(reason, expected))
            {
                throw makeError(message, reason, expected, "isRejected");
            }
        }
    },

    fail: (message?: string): never =>
    {
        throw fail(message);
    },
};

type AssertObject = typeof assert;

interface AssertFunction extends AssertObject
{
    (value: unknown, message?: string): asserts value;
}

const callableAssert = ((value: unknown, message?: string): void =>
{
    if (!value)
    {
        throw makeError(message, value, "truthy", "ok");
    }
}) as unknown as AssertFunction;

Object.assign(callableAssert, assert);

export default callableAssert;

export function use(_plugin: unknown): void
{
    // chai-as-promised behavior (isFulfilled/isRejected/reject/rejects) is built in.
}

function isEmptyValue(value: unknown): boolean
{
    if (value == null)
    {
        return true;
    }

    if (typeof value == "string" || typeof value == "number" || Array.isArray(value))
    {
        return (value as { length: number }).length == 0;
    }

    if (typeof value == "object")
    {
        if (value instanceof Map || value instanceof Set)
        {
            return (value as { size: number }).size == 0;
        }

        return Object.keys(value as object).length == 0;
    }

    return false;
}

function includes(haystack: unknown, needle: unknown): boolean
{
    if (typeof haystack == "string")
    {
        return haystack.includes(String(needle));
    }

    if (Array.isArray(haystack))
    {
        return haystack.some(item => isDeepEqual(item, needle));
    }

    if (typeof haystack == "object" && haystack != null)
    {
        return Object.values(haystack as object).some(item => isDeepEqual(item, needle));
    }

    return isDeepEqual(haystack, needle);
}

function runAndCatch(fn: () => unknown): Error | null
{
    try
    {
        fn();
    }
    catch (error)
    {
        return error as Error;
    }

    return null;
}

async function getReason(promise: Promise<unknown>): Promise<unknown>
{
    try
    {
        await promise;
    }
    catch (error)
    {
        return error;
    }

    return undefined;
}

function satisfiesExpectation(error: unknown, expected: unknown): boolean
{
    if (typeof expected == "string")
    {
        return error instanceof Error && error.message.includes(expected);
    }

    if (expected instanceof RegExp)
    {
        return error instanceof Error && expected.test(error.message);
    }

    if (typeof expected == "function")
    {
        return expected instanceof Function && error instanceof expected;
    }

    return isDeepEqual(error, expected);
}

function normalize(error: unknown, actual: unknown, expected: unknown, operator: string): AssertionError
{
    if (error instanceof Error && "actual" in (error as object) && "expected" in (error as object))
    {
        return error as AssertionError;
    }

    return makeError(error instanceof Error ? error.message : undefined, actual, expected, operator);
}