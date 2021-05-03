export type CommonParsePatternPathValidExpectation =
{
    pattern:   string,
    matches:   string[],
    regex:     RegExp,
    unmatches: string[],
};

export const validExpectations: CommonParsePatternPathValidExpectation[] =
[
    {
        matches:   ["foo"],
        pattern:   "foo",
        regex:     /^foo$/,
        unmatches: ["bar/foo"],
    },
    {
        matches:   ["foo/bar"],
        pattern:   "**/bar",
        regex:     /^(.*)(\/|\\)?bar$/,
        unmatches: ["foo"],
    },
    {
        matches:   ["bar/foo/foo", "/bar/foo/foo", "foo/bar/foo", "foo/foo/bar/"],
        pattern:   "**/bar/**",
        regex:     /^(.*)(\/|\\)?bar(\/|\\)(.*)(\/|\\)?$/,
        unmatches: ["foo/foo/bar"],
    },
    {
        matches:   ["file.ext", "/file.ext", "foo/file.ext"],
        pattern:   "**/*.ext",
        regex:     /^(.*)(\/|\\)?([^\/\\]*)\.ext$/,
        unmatches: ["file.ext/bar"],
    },
    {
        matches:   ["/file.ext", "foo/file.ext", "/file.x.ext", "foo/file.x.ext"],
        pattern:   "**/*(.x)?.ext",
        regex:     /^(.*)(\/|\\)?([^\/\\]*)(\.x)?\.ext$/,
        unmatches: ["ext"],
    },
    {
        matches:   ["/file.y.ext", "foo/file.x.ext"],
        pattern:   "**/*.(x|y).ext",
        regex:     /^(.*)(\/|\\)?([^\/\\]*)\.(x|y)\.ext$/,
        unmatches: ["file.z.ext"],
    },
    {
        matches:   ["bar/file.ext", "/bar/file.ext", "foo/bar/file.ext", "foo/bar/baz/file.ext"],
        pattern:   "**/bar/**/*.ext",
        regex:     /^(.*)(\/|\\)?bar(\/|\\)(.*)(\/|\\)?([^\/\\]*)\.ext$/,
        unmatches: ["file.z.ext"],
    },
];