export type Scenario =
{
    pattern:   string,
    matches:   string[],
    regex:     RegExp,
    mismatches: string[],
};

export const validScenarios: Scenario[] =
[
    {
        matches:    ["foo", "bar"],
        pattern:    "*",
        regex:      /^[^\/\\]*$/,
        mismatches: ["bar/foo", "foo/bar"],
    },
    {
        matches:    ["foo", "foo/bar", "/", "/foo", "/foo/bar"],
        pattern:    "**",
        regex:      /^.*(?:\/|\\)?$/,
        mismatches: [],
    },
    {
        matches:    ["foo"],
        pattern:    "foo",
        regex:      /^foo$/,
        mismatches: ["bar/foo"],
    },
    {
        matches:    ["foo", "boo"],
        pattern:    "[fb]oo",
        regex:      /^[fb]oo$/,
        mismatches: ["boo/foo"],
    },
    {
        matches:    ["bar/foo"],
        pattern:    "bar/**",
        regex:      /^bar(?:\/|\\)?.*$/,
        mismatches: ["foo/bar"],
    },
    {
        matches:    ["foo/bar"],
        pattern:    "**/bar",
        regex:      /^.*(?:\/|\\)?bar$/,
        mismatches: ["foo"],
    },
    {
        matches:    ["foo\\bar"],
        pattern:    "**\\bar",
        regex:      /^.*(?:\/|\\)?bar$/,
        mismatches: ["foo"],
    },
    {
        matches:    ["bar/foo/foo", "/bar/foo/foo", "foo/bar/foo", "foo/foo/bar/"],
        pattern:    "**/bar/**",
        regex:      /^.*(?:\/|\\)?bar(?:\/|\\)?.*$/,
        mismatches: [],
    },
    {
        matches:    ["bar\\foo\\foo", "\\bar\\foo\\foo", "foo\\bar\\foo", "foo\\foo\\bar\\"],
        pattern:    "**\\bar\\**",
        regex:      /^.*(?:\/|\\)?bar(?:\/|\\)?.*$/,
        mismatches: [],
    },
    {
        matches:    ["file.ext", "/file.ext", "foo/file.ext"],
        pattern:    "**/*.ext",
        regex:      /^.*(?:\/|\\)?[^\/\\]*\.ext$/,
        mismatches: ["file.ext/bar"],
    },
    {
        matches:    ["file.ext", "\\file.ext", "foo\\file.ext"],
        pattern:    "**\\*.ext",
        regex:      /^.*(?:\/|\\)?[^\/\\]*\.ext$/,
        mismatches: ["file.ext/bar"],
    },
    {
        matches:    ["/file.ext", "foo/file.ext", "/file.x.ext", "foo/file.x.ext"],
        pattern:    "**/*(.x)?.ext",
        regex:      /^.*(?:\/|\\)?[^\/\\]*(\.x)?\.ext$/,
        mismatches: ["ext"],
    },
    {
        matches:    ["\\file.ext", "foo\\file.ext", "\\file.x.ext", "foo\\file.x.ext"],
        pattern:    "**\\*(.x)?.ext",
        regex:      /^.*(?:\/|\\)?[^\/\\]*(\.x)?\.ext$/,
        mismatches: ["ext"],
    },
    {
        matches:    ["/file.y.ext", "foo/file.x.ext"],
        pattern:    "**/*.(x|y).ext",
        regex:      /^.*(?:\/|\\)?[^\/\\]*\.(x|y)\.ext$/,
        mismatches: ["file.z.ext"],
    },
    {
        matches:    ["\\file.y.ext", "foo\\file.x.ext"],
        pattern:    "**\\*.(x|y).ext",
        regex:      /^.*(?:\/|\\)?[^\/\\]*\.(x|y)\.ext$/,
        mismatches: ["file.z.ext"],
    },
    {
        matches:    ["bar/file.ext", "/bar/file.ext", "foo/bar/file.ext", "foo/bar/baz/file.ext"],
        pattern:    "**\\bar\\**\\*.ext",
        regex:      /^.*(?:\/|\\)?bar(?:\/|\\).*(?:\/|\\)?[^\/\\]*\.ext$/,
        mismatches: ["file.z.ext"],
    },
    {
        matches:    ["bar\\file.ext", "\\bar\\file.ext", "foo\\bar\\file.ext", "foo\\bar\\baz\\file.ext"],
        pattern:    "**/bar\\**\\*.ext",
        regex:      /^.*(?:\/|\\)?bar(?:\/|\\).*(?:\/|\\)?[^\/\\]*\.ext$/,
        mismatches: ["file.z.ext"],
    },
];
