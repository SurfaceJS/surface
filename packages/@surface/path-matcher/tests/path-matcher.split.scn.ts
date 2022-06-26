import type PathMatcher from "../internal/path-matcher.js";

const skip = false;

export type SplitScenario =
{
    skip:     boolean,
    source:   string,
    expected: ReturnType<PathMatcher["split"]>,
};

export const splitScenarios: SplitScenario[] =
[
    {
        skip,
        source:   "./",
        expected:
        {
            base:    ".",
            pattern: "",
        },
    },
    {
        skip,
        source:   "..",
        expected:
        {
            base:    "..",
            pattern: "",
        },
    },
    {
        skip,
        source:   "../foo",
        expected:
        {
            base:    "../foo",
            pattern: "",
        },
    },
    {
        skip,
        source:   "/foo/../*{js,ts}",
        expected:
        {
            base:    "/foo/..",
            pattern: "*{js,ts}",
        },
    },
    {
        skip,
        source:   "/foo",
        expected:
        {
            base:    "/foo",
            pattern: "",
        },
    },
    {
        skip,
        source:   "/foo/",
        expected:
        {
            base:    "/foo",
            pattern: "",
        },
    },
    {
        skip,
        source:   "/foo@(",
        expected:
        {
            base:    "/foo@(",
            pattern: "",
        },
    },
    {
        skip,
        source:   "/foo{",
        expected:
        {
            base:    "/foo{",
            pattern: "",
        },
    },
    {
        skip,
        source:   "/foo[",
        expected:
        {
            base:    "/foo[",
            pattern: "",
        },
    },
    {
        skip,
        source:   "!/foo/",
        expected:
        {
            base:    "/foo",
            pattern: "",
        },
    },
    {
        skip,
        source:   "/foo/*",
        expected:
        {
            base:    "/foo",
            pattern: "*",
        },
    },
    {
        skip,
        source:   "/foo/**",
        expected:
        {
            base:    "/foo",
            pattern: "**",
        },
    },
    {
        skip,
        source:   "/foo/bar/baz/**/*.json",
        expected:
        {
            base:    "/foo/bar/baz",
            pattern: "**/*.json",
        },
    },
    {
        skip,
        source:   "/foo/ba?",
        expected:
        {
            base:    "/foo",
            pattern: "ba?",
        },
    },
    {
        skip,
        source:   "/foo/!(foo)",
        expected:
        {
            base:    "/foo",
            pattern: "!(foo)",
        },
    },
    {
        skip,
        source:   "/foo/*(foo)",
        expected:
        {
            base:    "/foo",
            pattern: "*(foo)",
        },
    },
    {
        skip,
        source:   "/foo/@(foo)",
        expected:
        {
            base:    "/foo",
            pattern: "@(foo)",
        },
    },
    {
        skip,
        source:   "/foo/+(foo)",
        expected:
        {
            base:    "/foo",
            pattern: "+(foo)",
        },
    },
    {
        skip,
        source:   "/foo/*.{js,ts}",
        expected:
        {
            base:    "/foo",
            pattern: "*.{js,ts}",
        },
    },
    {
        skip,
        source:   "/foo/ba[!z]",
        expected:
        {
            base:    "/foo",
            pattern: "ba[!z]",
        },
    },
];
