/* cSpell:ignore premajor, preminor, prepatch */

import type { ReleaseType } from "semver";

export function isPrerelease(releaseType: ReleaseType | "custom"): releaseType is Exclude<ReleaseType, "major" | "minor" | "patch">
{
    return releaseType.startsWith("pre");
}

export const toBoolean = (value: string): boolean => value === "" || value == "true";

export const toEnum = (...values: (string | [string, number | string])[]): (value?: string) => string | number =>
{
    const entries = values.map(x => typeof x == "string" ? [x.toLowerCase(), x] : [x[0].toLowerCase(), x[1]]);
    const $enum   = Object.fromEntries(entries) as Record<string, string | number>;

    return (value: string = ""): string | number =>
    {
        const entry = $enum[value.toLowerCase()];

        if (entry)
        {
            return entry;
        }

        throw new Error(`'${value}' is not an valid option of '${values.join(", ")}'`);
    };
};
