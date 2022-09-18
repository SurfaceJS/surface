import type Parser from "../internal/parser.js";

const skip = false;

export type SplitScenario =
{
    skip:     boolean,
    source:   string,
    expected: ReturnType<Parser["split"]>,
};

export const splitScenarios: SplitScenario[] =
[
    {
        skip,
        source:   "./",
        expected:
        {
            path:    ".",
            pattern: "",
        },
    },
    {
        skip,
        source:   "..",
        expected:
        {
            path:    "..",
            pattern: "",
        },
    },
    {
        skip,
        source:   "**",
        expected:
        {
            path:    "",
            pattern: "**",
        },
    },
    {
        skip,
        source:   "{js,ts}",
        expected:
        {
            path:    "",
            pattern: "{js,ts}",
        },
    },
    {
        skip,
        source:   "../foo",
        expected:
        {
            path:    "../foo",
            pattern: "",
        },
    },
    {
        skip,
        source:   "/foo/../*{js,ts}",
        expected:
        {
            path:    "/foo/..",
            pattern: "*{js,ts}",
        },
    },
    {
        skip,
        source:   "/foo",
        expected:
        {
            path:    "/foo",
            pattern: "",
        },
    },
    {
        skip,
        source:   "/foo/",
        expected:
        {
            path:    "/foo",
            pattern: "",
        },
    },
    {
        skip,
        source:   "/foo@(",
        expected:
        {
            path:    "/foo@(",
            pattern: "",
        },
    },
    {
        skip,
        source:   "/foo{",
        expected:
        {
            path:    "/foo{",
            pattern: "",
        },
    },
    {
        skip,
        source:   "/foo[",
        expected:
        {
            path:    "/foo[",
            pattern: "",
        },
    },
    {
        skip,
        source:   "!/foo/",
        expected:
        {
            path:    "/foo",
            pattern: "!",
        },
    },
    {
        skip,
        source:   "!(foo",
        expected:
        {
            path:    "(foo",
            pattern: "!",
        },
    },
    {
        skip,
        source:   "/foo/*",
        expected:
        {
            path:    "/foo",
            pattern: "*",
        },
    },
    {
        skip,
        source:   "/foo/**",
        expected:
        {
            path:    "/foo",
            pattern: "**",
        },
    },
    {
        skip,
        source:   "/foo/bar/baz/**/*.json",
        expected:
        {
            path:    "/foo/bar/baz",
            pattern: "**/*.json",
        },
    },
    {
        skip,
        source:   "/foo/ba?",
        expected:
        {
            path:    "/foo",
            pattern: "ba?",
        },
    },
    {
        skip,
        source:   "/foo/!(foo)",
        expected:
        {
            path:    "/foo",
            pattern: "!(foo)",
        },
    },
    {
        skip,
        source:   "/foo/*(foo)",
        expected:
        {
            path:    "/foo",
            pattern: "*(foo)",
        },
    },
    {
        skip,
        source:   "/foo/@(foo)",
        expected:
        {
            path:    "/foo",
            pattern: "@(foo)",
        },
    },
    {
        skip,
        source:   "/foo/+(foo)",
        expected:
        {
            path:    "/foo",
            pattern: "+(foo)",
        },
    },
    {
        skip,
        source:   "/foo/*.{js,ts}",
        expected:
        {
            path:    "/foo",
            pattern: "*.{js,ts}",
        },
    },
    {
        skip,
        source:   "/foo/ba[!z]",
        expected:
        {
            path:    "/foo",
            pattern: "ba[!z]",
        },
    },
    {
        skip,
        source:   "/foo/bar.@({js,ts})",
        expected:
        {
            path:    "/foo",
            pattern: "bar.@({js,ts})",
        },
    },
    {
        skip,
        source:   "/foo/bar{/,.}baz",
        expected:
        {
            path:    "/foo",
            pattern: "bar{/,.}baz",
        },
    },
    {
        skip,
        source:   "/foo/bar{/}baz",
        expected:
        {
            path:    "/foo",
            pattern: "bar{/}baz",
        },
    },
    {
        skip,
        source:   "/foo/bar-{1..2}",
        expected:
        {
            path:    "/foo",
            pattern: "bar-{1..2}",
        },
    },
    {
        skip,
        source:   "/foo/bar-'{1..2}'",
        expected:
        {
            path:    "/foo",
            pattern: "bar-'{1..2}'",
        },
    },
    {
        skip,
        source:   "/foo/bar-\"{1..2}\"",
        expected:
        {
            path:    "/foo",
            pattern: "bar-\"{1..2}\"",
        },
    },
    {
        skip,
        source:   "/foo/bar-\\{1..2}",
        expected:
        {
            path:    "/foo",
            pattern: "bar-\\{1..2}",
        },
    },
];
