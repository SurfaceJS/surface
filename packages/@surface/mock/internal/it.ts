import { makeIt } from "./common.js";

export default class It
{
    public static is = makeIt;
    public static any<T>(): T
    {
        return makeIt<T>(() => true);
    }

    public static includes<T>(...values: T[]): T
    {
        return makeIt<T>((value: unknown) => values.includes(value as T));
    }

    public static inRange<T extends number>(min: number, max: number, mode: "inclusive" | "exclusive"): T
    {
        return makeIt<T>((value: unknown) => typeof value == "number" && (mode == "inclusive" ? value >= min && value <= max : value > min && value < max));
    }

    public static notIncludes<T>(...values: T[]): T
    {
        return makeIt<T>((value: unknown) => !values.includes(value as T));
    }

    public static outRange<T extends number>(min: number, max: number, mode: "inclusive" | "exclusive"): T
    {
        return makeIt<T>((value: unknown) => typeof value == "number" && (mode == "inclusive" ? value <= min && value >= max : value < min && value > max));
    }

    public static regex<T extends string>(pattern: RegExp): T
    {
        return makeIt<T>((value: unknown) => typeof value == "string" && pattern.test(value));
    }
}
