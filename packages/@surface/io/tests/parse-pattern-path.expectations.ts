export type Scenario =
{
    pattern:   string,
    matches:   string[],
    regex:     RegExp,
    unmatches: string[],
};

export const validScenarios: Scenario[] =
[
    {
        matches:   ["foo", "bar"],
        pattern:   "*",
        regex:     /^[^\/\\]*$/,
        unmatches: ["bar/foo", "foo/bar"],
    },
    {
        matches:   ["foo", "foo/bar", "/", "/foo", "/foo/bar"],
        pattern:   "**",
        regex:     /^.*(?:\/|\\)?$/,
        unmatches: [],
    },
    {
        matches:   ["foo"],
        pattern:   "foo",
        regex:     /^foo$/,
        unmatches: ["bar/foo"],
    },
    {
        matches:   ["foo", "boo"],
        pattern:   "[fb]oo",
        regex:     /^[fb]oo$/,
        unmatches: ["boo/foo"],
    },
    {
        matches:   ["bar/foo"],
        pattern:   "bar/**",
        regex:     /^bar(?:\/|\\)?.*$/,
        unmatches: ["foo/bar"],
    },
    {
        matches:   ["foo/bar"],
        pattern:   "**/bar",
        regex:     /^.*(?:\/|\\)?bar$/,
        unmatches: ["foo"],
    },
    {
        matches:   ["foo\\bar"],
        pattern:   "**\\bar",
        regex:     /^.*(?:\/|\\)?bar$/,
        unmatches: ["foo"],
    },
    {
        matches:   ["bar/foo/foo", "/bar/foo/foo", "foo/bar/foo", "foo/foo/bar/"],
        pattern:   "**/bar/**",
        regex:     /^.*(?:\/|\\)?bar(?:\/|\\)?.*$/,
        unmatches: [],
    },
    {
        matches:   ["bar\\foo\\foo", "\\bar\\foo\\foo", "foo\\bar\\foo", "foo\\foo\\bar\\"],
        pattern:   "**\\bar\\**",
        regex:     /^.*(?:\/|\\)?bar(?:\/|\\)?.*$/,
        unmatches: [],
    },
    {
        matches:   ["file.ext", "/file.ext", "foo/file.ext"],
        pattern:   "**/*.ext",
        regex:     /^.*(?:\/|\\)?[^\/\\]*\.ext$/,
        unmatches: ["file.ext/bar"],
    },
    {
        matches:   ["file.ext", "\\file.ext", "foo\\file.ext"],
        pattern:   "**\\*.ext",
        regex:     /^.*(?:\/|\\)?[^\/\\]*\.ext$/,
        unmatches: ["file.ext/bar"],
    },
    {
        matches:   ["/file.ext", "foo/file.ext", "/file.x.ext", "foo/file.x.ext"],
        pattern:   "**/*(.x)?.ext",
        regex:     /^.*(?:\/|\\)?[^\/\\]*(\.x)?\.ext$/,
        unmatches: ["ext"],
    },
    {
        matches:   ["\\file.ext", "foo\\file.ext", "\\file.x.ext", "foo\\file.x.ext"],
        pattern:   "**\\*(.x)?.ext",
        regex:     /^.*(?:\/|\\)?[^\/\\]*(\.x)?\.ext$/,
        unmatches: ["ext"],
    },
    {
        matches:   ["/file.y.ext", "foo/file.x.ext"],
        pattern:   "**/*.(x|y).ext",
        regex:     /^.*(?:\/|\\)?[^\/\\]*\.(x|y)\.ext$/,
        unmatches: ["file.z.ext"],
    },
    {
        matches:   ["\\file.y.ext", "foo\\file.x.ext"],
        pattern:   "**\\*.(x|y).ext",
        regex:     /^.*(?:\/|\\)?[^\/\\]*\.(x|y)\.ext$/,
        unmatches: ["file.z.ext"],
    },
    {
        matches:   ["bar/file.ext", "/bar/file.ext", "foo/bar/file.ext", "foo/bar/baz/file.ext"],
        pattern:   "**\\bar\\**\\*.ext",
        regex:     /^.*(?:\/|\\)?bar(?:\/|\\).*(?:\/|\\)?[^\/\\]*\.ext$/,
        unmatches: ["file.z.ext"],
    },
    {
        matches:   ["bar\\file.ext", "\\bar\\file.ext", "foo\\bar\\file.ext", "foo\\bar\\baz\\file.ext"],
        pattern:   "**/bar\\**\\*.ext",
        regex:     /^.*(?:\/|\\)?bar(?:\/|\\).*(?:\/|\\)?[^\/\\]*\.ext$/,
        unmatches: ["file.z.ext"],
    },
];
