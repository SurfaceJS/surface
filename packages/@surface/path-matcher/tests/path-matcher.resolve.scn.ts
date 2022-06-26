import { resolve } from "path";

const skip = false;

export type ResolveScenario =
{
    skip: boolean,
    base: string,
    pattern: string,
    expected: string,
};

export const resolveScenarios: ResolveScenario[] =
[
    {
        skip,
        base:     resolve("/"),
        pattern:  "",
        expected: resolve("/"),
    },
    {
        skip,
        base:     resolve("/"),
        pattern:  ".",
        expected: resolve("/"),
    },
    {
        skip,
        base:     resolve("/foo"),
        pattern:  "..",
        expected: resolve("/"),
    },
    {
        skip,
        base:     resolve("/foo"),
        pattern:  "**",
        expected: resolve("/foo/**"),
    },
    {
        skip,
        base:     resolve("/foo"),
        pattern:  "../**",
        expected: resolve("/**"),
    },
    {
        skip,
        base:     resolve("/foo"),
        pattern:  "!bar/**",
        expected: `!${resolve("/foo/bar/**")}`,
    },
];
