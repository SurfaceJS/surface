export function assert(condition: unknown, message: string = "Assertion failed."): asserts condition
{
    if (!condition)
    {
        throw new Error(message);
    }
}

export function assertGet<T>(value: T | null | undefined, message?: string): T
{
    if (!hasValue(value))
    {
        throw new Error(message);
    }

    return value;
}

export function compare<T extends string | number>(left: T, right: T): number
{
    if (left > right)
    {
        return 1;
    }
    else if (left < right)
    {
        return -1;
    }

    return 0;
}

export function hasFlag<T extends number>(value: T, flag: T): boolean
{
    return (value & flag) == flag;
}

export function hasValue(value: unknown): value is Object;
export function hasValue<T>(value: T | null | undefined): value is NonNullable<T>
{
    return value !== null && value !== undefined;
}

export function isIterable(source: object): source is Iterable<unknown>;
export function isIterable<T>(source: object): source is Iterable<T>;
export function isIterable(source: { [Symbol.iterator]?: Function }): source is Iterable<unknown>
{
    return typeof source[Symbol.iterator] == "function";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function tuple<TArgs extends any[]>(...args: TArgs): TArgs
{
    return args;
}

export function typeGuard<T>(_target: unknown, condition: boolean): _target is T
{
    return condition;
}