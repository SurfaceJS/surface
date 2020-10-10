export const analyzerDefaultSizesPattern = /^parsed|stat|gzip$/i;
export const analyzerLogLevelPattern     = /^info|warn|error|silent$/i;
export const analyzerModePattern         = /^server|static|json|disabled$/i;
export const booleanPattern              = /^true|false$/i;
export const logLevelPattern             = /^errors-only|minimal|none|normal|verbose$/i;
export const modePattern                 = /^development|none|production$/i;
export const targetPattern               = /^node|web$/i;

export function normalizeUrlPath(path: string): string
{
    return path ? (path.startsWith("/") ? "" : "/") + path.replace(/\/$/, "") : "";
}

export function removeUndefined<T extends object>(target: T): T
{
    type Key   = keyof T;
    type Value = T[Key];

    const result: Partial<Record<Key, Value>> = { };

    for (const [key, value] of Object.entries(target) as [Key, Value][])
    {
        if (!Object.is(value, undefined))
        {
            result[key] = value;
        }
    }

    return result as T;
}

export const parsePattern = (pattern: RegExp) =>
    (value: string = ""): string =>
    {
        if (pattern.test(value))
        {
            return value.toLowerCase();
        }

        throw new Error(`'${value}' dont match the pattern ${pattern}`);
    };

export function toArray(value: string = ""): string[]
{
    return value.split(",");
}

export function toBoolean(value: string = ""): boolean
{
    return !value
        ? false
        : booleanPattern.test(value)
            ? value.toLowerCase() == "true"
            : false;
}

export function toBooleanOrStringArray(value: string): boolean | string[]
{
    return !value
        ? false
        : booleanPattern.test(value)
            ? value.toLowerCase() == "true"
            : value.split(",");
}

export function log(message?: unknown, ...params: unknown[]): void
{
    console.log(message, ...params);
}