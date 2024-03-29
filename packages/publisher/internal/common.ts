/* cSpell:ignore premajor, preminor, prepatch, onentry */

import { dirname }                              from "path";
import { timestamp }                            from "@surface/core";
import conventionalChangelog                    from "conventional-changelog";
import conventionalRecommendedBump              from "conventional-recommended-bump";
import { type ReleaseType }                     from "semver";
import tar                                      from "tar";
import type { GlobPrerelease, SemanticVersion } from "./types/version.js";

/* c8 ignore start */

const GLOB_PRERELEASE_PATTERN = /^\*(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
const SEMVER_PATTERN          = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
const VERSION_SPLIT_PATTERN   = /^(\*|(?:(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)))([+-].*)?$/;

const RELEASE_TYPES = new Set(["major", "minor", "patch", "premajor", "preminor", "prepatch", "prerelease"]);

type ConcatAble = { concat: () => Promise<Buffer> };

const getEnv = (): NodeJS.ProcessEnv => process.env;

export async function changelog(path: string, lernaPackage: string, preset: string = "angular"): Promise<Buffer>
{
    return new Promise<Buffer>
    (
        (resolve, reject) =>
        {
            const output: number[] = [];

            const handler = (buffer: Buffer | string): void =>
                void output.push(...Buffer.from(buffer));

            conventionalChangelog({ lernaPackage, preset, pkg: { path } }, {  }, { path: dirname(path) })
                .on("data", handler)
                .on("error", reject)
                .on("end", () => resolve(Buffer.from(output)));
        },
    );
}

export async function recommendedBump(path: string, lernaPackage: string, preset: string = "angular"): Promise<conventionalRecommendedBump.Callback.Recommendation>
{
    return new Promise
    (
        (resolve, reject) =>
            conventionalRecommendedBump({ preset, lernaPackage, path }, (error, recommendation) => error ? reject(error) : resolve(recommendation)),
    );
}

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
    if (value.toLowerCase() == "recommended" || isGlobPrerelease(value) || isSemanticVersion(value) || isReleaseType(value))
    {
        return value;
    }

    throw new Error(`'${value}' is not semantic version or an valid option of '${Array.from(RELEASE_TYPES.values()).join(", ")}'`);
};

export async function untar(buffer: Buffer): Promise<Map<string, string>>
{
    const entries: Promise<[string, string]>[] = [];

    tar.list({ onentry: (entry) => entries.push((entry as object as ConcatAble).concat().then((x: Buffer) => [String(entry.path), String(x)])) })
        .end(buffer);

    return new Map(await Promise.all(entries));
}

export { getEnv, timestamp };

/* c8 ignore stop */
