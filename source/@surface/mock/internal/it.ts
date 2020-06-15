import { makeIt } from "./common";

export default class It
{
    public static is          = makeIt;
    public static any         = <T>() => makeIt<T>(() => true);
    public static includes    = <T>(...values: Array<T>) => makeIt<T>((value: unknown) => values.includes(value as T));
    public static inRange     = <T extends number>(min: number, max: number, mode: "inclusive" | "exclusive") => makeIt<T>((value: unknown) => typeof value == "number" && (mode == "inclusive" ? value >= min && value <= max : value > min && value < max));
    public static notIncludes = <T>(...values: Array<T>) => makeIt<T>((value: unknown) => !values.includes(value as T));
    public static outRange    = <T extends number>(min: number, max: number, mode: "inclusive" | "exclusive") => makeIt<T>((value: unknown) => typeof value == "number" && (mode == "inclusive" ? value <= min && value >= max : value < min && value > max));
    public static regex       = <T extends string>(pattern: RegExp) => makeIt<T>((value: unknown) => typeof value == "string" && pattern.test(value));
}
