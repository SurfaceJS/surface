import { makeIt } from "./common.js";

export default class It
{
    public static is<T>(fn: (value: T) => boolean): T
    {
        return makeIt("is", [], fn);
    }

    public static any<T>(): T
    {
        return makeIt("any", [], () => true);
    }

    public static includes<T>(...values: T[]): T
    {
        return makeIt("includes", values, value => values.includes(value as T));
    }

    public static inRange<T extends number>(min: number, max: number, mode: "inclusive" | "exclusive"): T
    {
        return makeIt("inRange", [min, max, mode], value => typeof value == "number" && (mode == "inclusive" ? value >= min && value <= max : value > min && value < max));
    }

    public static notIncludes<T>(...values: T[]): T
    {
        return makeIt("notIncludes", values, value => !values.includes(value as T));
    }

    public static notInRange<T extends number>(min: number, max: number, mode: "inclusive" | "exclusive"): T
    {
        return makeIt("notInRange", [min, max, mode], value => typeof value == "number" && (mode == "inclusive" ? value <= min && value >= max : value < min && value > max));
    }

    public static regex<T extends string>(pattern: RegExp): T
    {
        return makeIt("notInRange", [pattern], value => typeof value == "string" && pattern.test(value));
    }
}
