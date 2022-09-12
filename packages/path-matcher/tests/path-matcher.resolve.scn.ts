import { resolve } from "path";

const skip = false;

const root = resolve("/").replace(/\\/g, "/");

export type ResolveScenario =
{
    skip:        boolean,
    base:        string,
    pattern:     string,
    fullPattern: string,
    unix?:       boolean,
};

export const resolveScenarios: ResolveScenario[] =
[
    {
        skip,
        base:        resolve("/"),
        pattern:     "",
        fullPattern: root,
    },
    {
        skip,
        base:        resolve("/"),
        pattern:     ".",
        fullPattern: root,
    },
    {
        skip,
        base:        resolve("/foo"),
        pattern:     "..",
        fullPattern: root,
    },
    {
        skip,
        base:        resolve("/foo"),
        pattern:     "**",
        fullPattern: `${root}foo/**`,
    },
    {
        skip,
        base:        resolve("/foo"),
        pattern:     "../**",
        fullPattern: `${root}**`,
    },
    {
        skip,
        base:        resolve("/foo"),
        pattern:     "!bar/**",
        fullPattern: `!${root}foo/bar/**`,
    },
    {
        skip,
        base:        resolve("/@foo?"),
        pattern:     "!bar/**",
        fullPattern: `!${root}\\@foo\\?/bar/**`,
    },
    {
        skip,
        base:        resolve("/@foo[1]{2}"),
        pattern:     "!bar/**",
        fullPattern: `!${root}\\@foo\\[1]\\{2}/bar/**`,
    },
    {
        skip,
        base:        "/foo",
        pattern:     "**",
        fullPattern: "/foo/**",
        unix:        true,
    },
    {
        skip,
        base:        "/foo",
        pattern:     "..",
        fullPattern: "/",
        unix:        true,
    },
];
