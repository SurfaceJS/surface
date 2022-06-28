/* eslint-disable max-lines */
/* eslint-disable no-empty-character-class */
/* eslint-disable no-control-regex */
// cSpell:ignore AGMSY, ekqw
import type { Options } from "../internal/path-matcher.js";

const skip = false;

export type Scenario =
{
    source:     string,
    options?:   Options,
    matches:    string[],
    regex:      RegExp,
    mismatches: string[],
    skip:       boolean,
};

export const scenarios: Scenario[] =
[
    {
        skip,
        source:     "",
        regex:      /^$/,
        matches:    [],
        mismatches: ["bar"],
    },
    {
        skip,
        source:     "foo",
        regex:      /^foo$/,
        matches:    ["foo"],
        mismatches: ["bar"],
    },
    {
        skip,
        source:     "?oo",
        regex:      /^.oo$/,
        matches:    ["boo", "foo"],
        mismatches: ["oo"],
    },
    {
        skip,
        source:     "*",
        regex:      /^[^.\/\\][^\/\\]*$/,
        matches:    ["boo", "foo"],
        mismatches: [".boo", "foo/bar"],
    },
    {
        skip,
        source:     "*",
        options:    { dot: true },
        regex:      /^[^\/\\]*$/,
        matches:    [".foo", "foo"],
        mismatches: ["foo/bar"],
    },
    {
        skip,
        source:     "*oo",
        regex:      /^[^.\/\\][^\/\\]*oo$/,
        matches:    ["boo", "foo"],
        mismatches: ["oof", ".oo"],
    },
    {
        skip,
        source:     "*oo",
        options:    { dot: true },
        regex:      /^[^\/\\]*oo$/,
        matches:    ["boo", "foo", ".oo"],
        mismatches: ["oof"],
    },
    {
        skip,
        source:     "[fb]oo",
        regex:      /^[fb]oo$/,
        matches:    ["boo", "foo"],
        mismatches: ["too", "soo"],
    },
    {
        skip,
        source:     "[^fb]oo",
        regex:      /^[^fb]oo$/,
        matches:    ["too", "soo"],
        mismatches: ["boo", "foo"],
    },
    {
        skip,
        source:     "[!fb]oo",
        regex:      /^[^fb]oo$/,
        matches:    ["too", "soo"],
        mismatches: ["boo", "foo"],
    },
    {
        skip,
        source:     "[]",
        regex:      /^[]$/,
        matches:    [],
        mismatches: ["", "."],
    },
    {
        skip,
        source:     "[[]oo",
        regex:      /^[\[]oo$/,
        matches:    ["[oo"],
        mismatches: ["]oo"],
    },
    {
        skip,
        source:     "[]]oo",
        regex:      /^[\]]oo$/,
        matches:    ["]oo"],
        mismatches: ["[oo"],
    },
    {
        skip,
        source:     "[a\\]]oo",
        regex:      /^[a\]]oo$/,
        matches:    ["aoo", "]oo"],
        mismatches: ["a[oo"],
    },
    {
        skip,
        source:     "[a-z]]oo",
        regex:      /^[a-z]\]oo$/,
        matches:    ["a]oo"],
        mismatches: ["]oo"],
    },
    {
        skip,
        source:     "[a",
        regex:      /^\[a$/,
        matches:    ["[a"],
        mismatches: ["[", "a"],
    },
    {
        skip,
        source:     "[:a",
        regex:      /^\[:a$/,
        matches:    ["[:a"],
        mismatches: ["[", ":", "a"],
    },
    {
        skip,
        source:     "[:alnum:]",
        regex:      /^[A-Za-z0-9]$/,
        matches:    ["a", "z", "A", "Z", "0", "9"],
        mismatches: [".", "!"],
    },
    {
        skip,
        source:     "[:alpha:]",
        regex:      /^[A-Za-z]$/,
        matches:    ["a", "z", "A", "Z"],
        mismatches: ["1", "."],
    },
    {
        skip,
        source:     "[:ascii:]",
        regex:      /^[\x00-\x7F]$/,
        matches:    ["\x00", "\x7F"],
        mismatches: ["\x8A"],
    },
    {
        skip,
        source:     "[:blank:]",
        regex:      /^[ \t]$/,
        matches:    ["\t", " "],
        mismatches: ["."],
    },
    {
        skip,
        source:     "[:cntrl:]",
        regex:      /^[\x00-\x1F\x7F]$/,
        matches:    ["\x00", "\x1F", "\x7F"],
        mismatches: ["\x2A", "\x8A"],
    },
    {
        skip,
        source:     "[:digit:]",
        regex:      /^\d$/,
        matches:    ["0", "9"],
        mismatches: ["A", "Z"],
    },
    {
        skip,
        source:     "[:graph:]",
        regex:      /^[\x21-\x7E]$/,
        matches:    ["\x21", "\x7E"],
        mismatches: ["\x20", "\x8A"],
    },
    {
        skip,
        source:     "[:lower:]",
        regex:      /^[a-z]$/,
        matches:    ["a", "z"],
        mismatches: ["A", "Z"],
    },
    {
        skip,
        source:     "[:print:]",
        regex:      /^[\x20-\x7E]$/,
        matches:    ["\x20", "\x7E"],
        mismatches: ["\x1F", "\x7F"],
    },
    {
        skip,
        source:     "[:punct:]",
        regex:      /^[^ A-Za-z0-9]$/,
        matches:    [".", ",", "!", "?"],
        mismatches: ["a", "0"],
    },
    {
        skip,
        source:     "[:space:]",
        regex:      /^\s$/,
        matches:    [" "],
        mismatches: ["a"],
    },
    {
        skip,
        source:     "[:upper:]",
        regex:      /^[A-Z]$/,
        matches:    ["A", "Z"],
        mismatches: ["a", "z"],
    },
    {
        skip,
        source:     "[:word:]",
        regex:      /^\w$/,
        matches:    ["A", "0", "_"],
        mismatches: ["-", "."],
    },
    {
        skip,
        source:     "[:xdigit:]",
        regex:      /^[0-9a-fA-F]$/,
        matches:    ["0", "F", "C"],
        mismatches: ["G", "10"],
    },
    {
        skip,
        source:     "(a|b)",
        regex:      /^\(a\|b\)$/,
        matches:    ["(a|b)"],
        mismatches: ["a", "b"],
    },
    {
        skip,
        source:     "@a",
        regex:      /^@a$/,
        matches:    ["@a"],
        mismatches: ["@", "a"],
    },
    {
        skip,
        source:     "@(a",
        regex:      /^@\(a$/,
        matches:    ["@(a"],
        mismatches: ["@", "(", "a"],
    },
    {
        skip,
        source:     "@(a|b)",
        regex:      /^(?:a|b)$/,
        matches:    ["a", "b"],
        mismatches: ["c"],
    },
    {
        skip,
        options:    { noExtGlob: true },
        source:     "@(a|b)",
        regex:      /^@\(a\|b\)$/,
        matches:    ["@(a|b)"],
        mismatches: ["a", "b"],
    },
    {
        skip,
        source:     "@(@(a|b))",
        regex:      /^(?:(?:a|b))$/,
        matches:    ["a", "b"],
        mismatches: ["c"],
    },
    {
        skip,
        source:     "@(a\\|b)",
        regex:      /^(?:a\|b)$/,
        matches:    ["a|b"],
        mismatches: ["a", "b"],
    },
    {
        skip,
        source:     "@((a\\|b))",
        regex:      /^(?:\(a\|b\))$/,
        matches:    ["(a|b)"],
        mismatches: ["a", "b"],
    },
    {
        skip,
        source:     "@((a\\|b\\)|@(a|b)|a\\|b)",
        regex:      /^(?:\(a\|b\)|(?:a|b)|a\|b)$/,
        matches:    ["(a|b)", "a|b", "a", "b"],
        mismatches: ["ab"],
    },
    {
        skip,
        source:     "?(a|b)",
        regex:      /^(?:a|b)?$/,
        matches:    ["", "a", "b"],
        mismatches: ["c"],
    },
    {
        skip,
        source:     "?(?(a|b))",
        regex:      /^(?:(?:a|b)?)?$/,
        matches:    ["", "a", "b"],
        mismatches: ["c"],
    },
    {
        skip,
        source:     "?(a\\|b)",
        regex:      /^(?:a\|b)?$/,
        matches:    ["", "a|b"],
        mismatches: ["a", "b"],
    },
    {
        skip,
        source:     "?((a\\|b))",
        regex:      /^(?:\(a\|b\))?$/,
        matches:    ["", "(a|b)"],
        mismatches: ["a", "b"],
    },
    {
        skip,
        source:     "?((a\\|b\\)|?(a|b)|a\\|b)",
        regex:      /^(?:\(a\|b\)|(?:a|b)?|a\|b)?$/,
        matches:    ["", "(a|b)", "a|b", "a", "b"],
        mismatches: ["ab"],
    },
    {
        skip,
        source:     "*(a|b)",
        regex:      /^(?:a|b)*$/,
        matches:    ["", "a", "b", "aa", "bb"],
        mismatches: ["c"],
    },
    {
        skip,
        source:     "*(*(a|b))",
        regex:      /^(?:(?:a|b)*)*$/,
        matches:    ["", "a", "b", "aa", "bb"],
        mismatches: ["c"],
    },
    {
        skip,
        source:     "*(a\\|b)",
        regex:      /^(?:a\|b)*$/,
        matches:    ["", "a|b", "a|ba|b"],
        mismatches: ["a", "b"],
    },
    {
        skip,
        source:     "*((a\\|b))",
        regex:      /^(?:\(a\|b\))*$/,
        matches:    ["", "(a|b)"],
        mismatches: ["a", "b"],
    },
    {
        skip,
        source:   "*((a\\|b\\)|*(a|b)|a\\|b)",
        regex:     /^(?:\(a\|b\)|(?:a|b)*|a\|b)*$/,
        matches:
        [
            "",
            "a",
            "b",
            "ab",
            "aa|b",
            "ba|b",
            "a|b",
            "a|b(a|b)",
            "(a|b)",
            "aa",
            "bb",
            "a|ba|b",
            "(a|b)(a|b)",
        ],
        mismatches: ["|"],
    },
    {
        skip,
        source:     "+(a|b)",
        regex:      /^(?:a|b)+$/,
        matches:    ["a", "b", "aa", "bb"],
        mismatches: ["", "c"],
    },
    {
        skip,
        source:     "+(+(a|b))",
        regex:      /^(?:(?:a|b)+)+$/,
        matches:    ["a", "b", "aa", "bb"],
        mismatches: ["", "c"],
    },
    {
        skip,
        source:     "+(a\\|b)",
        regex:      /^(?:a\|b)+$/,
        matches:    ["a|b", "a|ba|b"],
        mismatches: ["", "a", "b"],
    },
    {
        skip,
        source:     "+((a\\|b))",
        regex:      /^(?:\(a\|b\))+$/,
        matches:    ["(a|b)"],
        mismatches: ["", "a", "b"],
    },
    {
        skip,
        source:   "+((a\\|b\\)|+(a|b)|a\\|b)",
        regex:     /^(?:\(a\|b\)|(?:a|b)+|a\|b)+$/,
        matches:
        [
            "a",
            "b",
            "ab",
            "aa|b",
            "ba|b",
            "a|b",
            "a|b(a|b)",
            "(a|b)",
            "aa",
            "bb",
            "a|ba|b",
            "(a|b)(a|b)",
        ],
        mismatches: [""],
    },
    {
        skip,
        source:     "!(a|b)",
        regex:      /^(?:(?!a|b).*)$/,
        matches:    ["c"],
        mismatches: ["a", "b"],
    },
    {
        skip,
        source:     "!(!(a|b))",
        regex:      /^(?:(?!(?:(?!a|b).*)).*)$/,
        matches:    ["a", "b"],
        mismatches: ["c"],
    },
    {
        skip,
        source:     "!(a\\|b)",
        regex:      /^(?:(?!a\|b).*)$/,
        matches:    ["", "a", "b"],
        mismatches: ["a|b", "a|ba|b"],
    },
    {
        skip,
        source:     "!((a\\|b))",
        regex:      /^(?:(?!\(a\|b\)).*)$/,
        matches:    ["", "a", "b"],
        mismatches: ["(a|b)"],
    },
    {
        skip,
        source:   "!((a\\|b\\)|!(a|b)|a\\|b)",
        regex:     /^(?:(?!\(a\|b\)|(?:(?!a|b).*)|a\|b).*)$/,
        matches:
        [
            "a",
            "b",
            "ab",
            "aa|b",
            "ba|b",
            "aa",
            "bb",
        ],
        mismatches:
        [
            "a|b",
            "a|b(a|b)",
            "(a|b)",
            "a|ba|b",
            "(a|b)(a|b)",
        ],
    },
    {
        skip,
        source:     "/foo",
        regex:      /^[\/\\]foo$/,
        matches:    ["/foo"],
        mismatches: ["foo", "/Foo"],
    },
    {
        skip,
        source:     "/foo",
        options:    { noCase: true },
        regex:      /^[\/\\]foo$/i,
        matches:    ["/foo", "/Foo"],
        mismatches: ["foo"],
    },
    {
        skip,
        source:     "/foo/*",
        regex:      /^[\/\\]foo[\/\\][^.\/\\][^\/\\]*$/,
        matches:    ["/foo/bar"],
        mismatches: ["foo"],
    },
    {
        skip,
        source:     "/foo/*/bar",
        regex:      /^[\/\\]foo[\/\\][^.\/\\][^\/\\]*[\/\\]bar$/,
        matches:    ["/foo/baz/bar"],
        mismatches: ["/foo", "bar", "/foo/bar", "/foo/baz/baz/bar"],
    },
    {
        skip,
        source:     "/foo/**",
        regex:      /^[\/\\]foo[\/\\](?:[^.\/\\][^\/\\]*[\/\\]?)*$/,
        matches:    ["/foo/bar", "/foo/bar/baz"],
        mismatches: ["foo", "/foo/.bar", "/foo/bar/.baz"],
    },
    {
        skip,
        source:     "/foo/**",
        options:    { noGlobStar: true },
        regex:      /^[\/\\]foo[\/\\][^.\/\\][^\/\\]*$/,
        matches:    ["/foo/bar", "/foo/baz"],
        mismatches: ["foo", "/foo/.bar", "/foo/bar/baz"],
    },
    {
        skip,
        source:     "/foo/**/.bar",
        regex:      /^[\/\\]foo[\/\\](?:[^.\/\\][^\/\\]*[\/\\]?)*\.bar$/,
        matches:    ["/foo/.bar", "/foo/bar/.bar"],
        mismatches: ["foo"],
    },
    {
        skip,
        source:     "/foo/**",
        options:    { dot: true },
        regex:      /^[\/\\]foo[\/\\](?!\.\.?[\/\\]).*[\/\\]?$/,
        matches:    ["/foo/bar", "/foo/bar/baz", "/foo/.bar", "/foo/bar/.baz"],
        mismatches: ["foo"],
    },
    {
        skip,
        source:     "**/foo",
        regex:      /^(?:[^.\/\\][^\/\\]*[\/\\]?)*foo$/,
        matches:    ["bar/foo"],
        mismatches: ["bar", ".bar/foo"],
    },
    {
        skip,
        source:     "**/foo/**",
        regex:      /^(?:[^.\/\\][^\/\\]*[\/\\]?)*foo[\/\\](?:[^.\/\\][^\/\\]*[\/\\]?)*$/,
        matches:    ["bar/foo/bar"],
        mismatches: ["foo", ".bar/foo/bar", "bar/foo/.bar"],
    },
    {
        skip,
        source:     "**/foo/**/bar",
        regex:      /^(?:[^.\/\\][^\/\\]*[\/\\]?)*foo[\/\\](?:[^.\/\\][^\/\\]*[\/\\]?)*bar$/,
        matches:    ["bar/foo/bar", "bar/foo/baz/bar"],
        mismatches: ["foo", "bar", "bar/foobar/bar", "bar/foo/.baz/bar"],
    },
    {
        skip,
        source:     "!/foo/**",
        regex:      /^(?!^(?:[\/\\]foo[\/\\](?:[^.\/\\][^\/\\]*[\/\\]?)*)|(?:(^|.*[\/\\])\.[^\/\\]+[\/\\]?.*)$).*$/,
        matches:    ["/bar/foo"],
        mismatches: ["/foo/bar", "/.bar/foo", "/bar/.foo"],
    },
    {
        skip,
        source:     "!/foo/**",
        options:    { dot: true },
        regex:      /^(?!^[\/\\]foo[\/\\](?!\.\.?[\/\\]).*[\/\\]?$).*$/,
        matches:    ["/bar/foo", "/.bar/foo", "/bar/.foo"],
        mismatches: ["/foo/bar"],
    },
    {
        skip,
        source:     "!**/foo/**/bar",
        regex:      /^(?!^(?:[^\/\\]*[\/\\]foo[\/\\](?:[^.\/\\][^\/\\]*[\/\\]?)*bar)|(?:(^|.*[\/\\])\.[^\/\\]+[\/\\]?.*)$).*$/,
        matches:    ["foo/bar/foo", "bar/bar", "foo/foo"],
        mismatches: ["bar/foo/bar", ".bar/bar", ".foo/foo"],
    },
    {
        skip,
        source:     "!**/foo/**/bar",
        options:    { noNegate: true },
        regex:      /^![^\/\\]*[\/\\]foo[\/\\](?:[^.\/\\][^\/\\]*[\/\\]?)*bar$/,
        matches:    ["!/foo/bar"],
        mismatches: ["foo/bar", ".bar/bar", ".foo/foo"],
    },
    {
        skip,
        source:     "{a,b",
        regex:      /^\{a,b$/,
        matches:    ["{a,b"],
        mismatches: ["a", "b"],
    },
    {
        skip,
        source:     "{{a,b}}",
        regex:      /^(?:\{a|b)\}$/,
        matches:    ["{a}", "b}"],
        mismatches: ["a", "b"],
    },
    {
        skip,
        source:     "{a,b}",
        regex:      /^(?:a|b)$/,
        matches:    ["a", "b"],
        mismatches: ["(a|b)"],
    },
    {
        skip,
        source:     "{a,b}",
        options:    { noBrace: true },
        regex:      /^\{a,b\}$/,
        matches:    ["{a,b}"],
        mismatches: ["a", "b"],
    },
    {
        skip,
        source:     "a{,b,c}d",
        regex:      /^a(?:b|c)?d$/,
        matches:    ["ad", "abd", "acd"],
        mismatches: ["a", "d", "abcd"],
    },
    {
        skip,
        source:     "{a..c}",
        regex:      /^(?:[a-c])$/,
        matches:    ["a", "b", "c"],
        mismatches: ["d"],
    },
    {
        skip,
        source:     "{a..c}",
        options:    { noBrace: true },
        regex:      /^\{a\.\.c\}$/,
        matches:    ["{a..c}"],
        mismatches: ["a", "b", "c"],
    },
    {
        skip,
        source:     "{Z..a}",
        regex:      /^(?:[Z[\]\^_`a])$/,
        matches:    ["Z", "[", "]", "^", "_", "`", "a"],
        mismatches: ["A", "z"],
    },
    {
        skip,
        source:     "{A..z..6}",
        regex:      /^(?:[AGMSY_ekqw])$/,
        matches:    ["A", "G", "M", "S", "Y", "_", "e", "k", "q", "w"],
        mismatches: ["B", "F", "b", "f"],
    },
    {
        skip,
        source:     "**/file{,000..100}.{js,ts}",
        regex:      /^(?:[^.\/\\][^\/\\]*[\/\\]?)*file(?:100|0[1-9]\d|00\d)?\.(?:js|ts)$/,
        matches:    ["file.ts", "file000.ts", "foo/file050.js", "foo/bar/file100.ts"],
        mismatches: ["foo", "bar", "bar/foobar/bar"],
    },
    {
        skip,
        source:     "file-{a..c,1..3}",
        regex:      /^file-(?:[a-c]|[1-3])$/,
        matches:    ["file-a", "file-b", "file-c", "file-1", "file-2", "file-3"],
        mismatches: ["file", "file-a1"],
    },
    {
        skip,
        source:     "/foo/bar's",
        regex:      /^[\/\\]foo[\/\\]bar's$/,
        matches:    ["/foo/bar's"],
        mismatches: ["/foo/bar"],
    },
    {
        skip,
        source:     "/foo/bar\"'s\"",
        regex:      /^[\/\\]foo[\/\\]bar's$/,
        matches:    ["/foo/bar's"],
        mismatches: ["/foo/bar"],
    },
    {
        skip,
        source:     "/foo/bar\"\\\"s\"",
        regex:      /^[\/\\]foo[\/\\]bar"s$/,
        matches:    ["/foo/bar\"s"],
        mismatches: ["/foo/bar"],
    },
    {
        skip,
        source:     "/foo/\"*\"",
        regex:      /^[\/\\]foo[\/\\]\*$/,
        matches:    ["/foo/*"],
        mismatches: ["/foo/bar"],
    },
    {
        skip,
        source:     "/foo/bar@(' '|.)baz",
        regex:      /^[\/\\]foo[\/\\]bar(?: |\.)baz$/,
        matches:    ["/foo/bar baz", "/foo/bar.baz"],
        mismatches: ["/foo/bar"],
    },
    {
        skip,
        source:     "/foo/bar@( |.)baz",
        regex:      /^[\/\\]foo[\/\\]bar(?: |\.)baz$/,
        matches:    ["/foo/bar baz", "/foo/bar.baz"],
        mismatches: ["/foo/bar"],
    },
    {
        skip,
        source:     "/foo/bar{ ,.}baz",
        regex:      /^[\/\\]foo[\/\\]bar(?: |\.)baz$/,
        matches:    ["/foo/bar baz", "/foo/bar.baz"],
        mismatches: ["/foo/bar"],
    },
    {
        skip,
        source:     "/foo/bar{@(a|b)}baz",
        regex:      /^[\/\\]foo[\/\\]bar(?:@\(a\|b\))baz$/,
        matches:    ["/foo/bar@(a|b)baz"],
        mismatches: ["/foo/bar"],
    },
    {
        skip,
        source:     "/foo/bar@({a,b})baz",
        regex:      /^[\/\\]foo[\/\\]bar(?:\{a,b\})baz$/,
        matches:    ["/foo/bar{a,b}baz"],
        mismatches: ["/foo/bar"],
    },
    {
        skip,
        source:     "/foo/bar@('@(a)')baz",
        regex:      /^[\/\\]foo[\/\\]bar(?:@\(a\))baz$/,
        matches:    ["/foo/bar@(a)baz"],
        mismatches: ["/foo/bar"],
    },
    {
        skip,
        source:     "/foo/bar{' ',.}baz",
        regex:      /^[\/\\]foo[\/\\]bar(?: |\.)baz$/,
        matches:    ["/foo/bar baz", "/foo/bar.baz"],
        mismatches: ["/foo/bar"],
    },
    {
        skip,
        source:     "{'{a,b}'}",
        regex:      /^(?:\{a,b\})$/,
        matches:    ["{a,b}"],
        mismatches: ["a", "b"],
    },
];
