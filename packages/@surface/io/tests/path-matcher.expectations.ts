import { resolve }      from "path";
import type PathMatcher from "../internal/path-matcher.js";

const skip = false;

export type Scenario =
{
    patterns: ConstructorParameters<typeof PathMatcher>[0],
    expected: { path: string, hasMatches: boolean }[],
    skip:     boolean,
};

export const validScenarios: Scenario[] =
[
    {
        patterns: [],
        expected: [],
        skip,
    },
    {
        patterns: "**",
        expected:
        [
            {
                path:       "/foo",
                hasMatches: true,
            },
        ],
        skip,
    },
    {
        patterns: ["!**"],
        expected:
        [
            {
                path:       "/foo",
                hasMatches: false,
            },
        ],
        skip,
    },
    {
        patterns: ["**/bar", "/foo/**", "!**/baz/**"],
        expected:
        [
            {
                path:       resolve("/foo"),
                hasMatches: true,
            },
            {
                path:       resolve("/foo/bar"),
                hasMatches: true,
            },
            {
                path:       resolve("/bar"),
                hasMatches: true,
            },
            {
                path:       resolve("/baz"),
                hasMatches: false,
            },
            {
                path:       resolve("/baz/foo"),
                hasMatches: false,
            },
            {
                path:       resolve("/foo/baz"),
                hasMatches: false,
            },
            {
                path:       resolve("/baz/bar"),
                hasMatches: false,
            },
        ],
        skip,
    },
    {
        patterns: /.*/,
        expected:
        [
            {
                path:       "/foo",
                hasMatches: true,
            },
            {
                path:       "/bar",
                hasMatches: true,
            },
        ],
        skip,
    },
];