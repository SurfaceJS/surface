import { resolve } from "path";

const skip = false;

const root = resolve("/").replaceAll("\\", "/");

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
        expected: root,
    },
    {
        skip,
        base:     resolve("/"),
        pattern:  ".",
        expected: root,
    },
    {
        skip,
        base:     resolve("/foo"),
        pattern:  "..",
        expected: root,
    },
    {
        skip,
        base:     resolve("/foo"),
        pattern:  "**",
        expected: `${root}foo/**`,
    },
    {
        skip,
        base:     resolve("/foo"),
        pattern:  "../**",
        expected: `${root}**`,
    },
    {
        skip,
        base:     resolve("/foo"),
        pattern:  "!bar/**",
        expected: `!${root}foo/bar/**`,
    },
    {
        skip,
        base:     resolve("/@foo?"),
        pattern:  "!bar/**",
        expected: `!${root}\\@foo\\?/bar/**`,
    },
    {
        skip,
        base:     resolve("/@foo[1]{2}"),
        pattern:  "!bar/**",
        expected: `!${root}\\@foo\\[1]\\{2}/bar/**`,
    },
];
