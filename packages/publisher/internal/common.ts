/* cSpell:ignore premajor, preminor, prepatch */

import { type ReleaseType }                     from "semver";
import type { GlobPrerelease, SemanticVersion } from "./types/version.js";

const GLOB_PRERELEASE_PATTERN = /^\*(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
const SEMVER_PATTERN          = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
const VERSION_SPLIT_PATTERN   = /^(\*|(?:(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)))([+-].*)?$/;

const RELEASE_TYPES = new Set(["major", "minor", "patch", "premajor", "preminor", "prepatch", "prerelease"]);

export function isGlobPrerelease(value: string): value is GlobPrerelease
{
    return GLOB_PRERELEASE_PATTERN.test(value);
}

export function isSemanticVersion(value: string): value is SemanticVersion
{
    return SEMVER_PATTERN.test(value);
}

export function isReleaseType(value: string): value is ReleaseType
{
    return RELEASE_TYPES.has(value.toLowerCase());
}

export function overridePrerelease(version: string, glob: string): string
{
    return `${VERSION_SPLIT_PATTERN.exec(version)?.[1]}${VERSION_SPLIT_PATTERN.exec(glob)?.[2] ?? ""}`;
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

export const toSemver = (value: string): string | number =>
{
    if (isGlobPrerelease(value) || isSemanticVersion(value) || isReleaseType(value))
    {
        return value;
    }

    throw new Error(`'${value}' is not semantic version or an valid option of '${Array.from(RELEASE_TYPES.values()).join(", ")}'`);
};
