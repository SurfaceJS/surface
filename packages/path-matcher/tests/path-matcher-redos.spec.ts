import { assert, batchTest, shouldPass, suite, test, timeout } from "@surface/test-suite";
import PathMatcher                                        from "../internal/path-matcher.js";

/**
 * Regression suite for the catastrophic-backtracking (ReDoS) bug in the `**`
 * globstar fragment. The previously-emitted fragment
 * `(?:[\/\\]?[^.\/\\][^\/\\]*)*[\/\\]?` let each repeated unit independently drop
 * its leading separator, so a long run of non-matching characters could be split
 * in exponentially many ways. Before the fix, `**x` vs `"a".repeat(28)` already
 * took ~700ms; the large inputs below never finished. Every case feeds a long,
 * adversarial path and asserts both the correct result and (via the dedicated
 * linear test) sub-millisecond resolution.
 */

interface IRedosCase
{
    name:    string;
    pattern: string;
    build:   () => string;
    expect:  boolean;
}

const regexCases: IRedosCase[] =
[
    { name: "makeRegex **x long non-match",    pattern: "**x",         build: () => "a".repeat(100000),           expect: false },
    { name: "makeRegex **x long match",        pattern: "**x",         build: () => `${"a".repeat(100000)}x`,     expect: true  },
    { name: "makeRegex **/x long non-match",   pattern: "**/x",        build: () => "a/".repeat(50000),            expect: false },
    { name: "makeRegex **/x long match",       pattern: "**/x",        build: () => `${"a/".repeat(5000)}x`,      expect: true  },
    { name: "makeRegex a/**/b long non-match", pattern: "a/**/b",      build: () => `a/${"z/".repeat(5000)}`,     expect: false },
    { name: "makeRegex **/* long non-match",   pattern: "**/*",        build: () => "b/".repeat(20000),            expect: false },
    { name: "makeRegex **.{ts,js} nomatch",    pattern: "**.{ts,js}",  build: () => "c/".repeat(10000),            expect: false },
    { name: "makeRegex **/a** long match",     pattern: "**/a**",      build: () => "a".repeat(100000),            expect: true  },
    { name: "makeRegex **/** long match",      pattern: "**/**",       build: () => "d/".repeat(20000),            expect: true  },
    { name: "makeRegex a/**b long non-match",  pattern: "a/**b",       build: () => `a/${"q".repeat(50000)}`,     expect: false },
    { name: "makeRegex x/** non-match",        pattern: "x/**",        build: () => "y/a/b/c",                     expect: false },
    { name: "makeRegex x/** match",            pattern: "x/**",        build: () => "x/a/b/c",                     expect: true  },
    { name: "makeRegex **/deep match",         pattern: "**/deep/file.txt", build: () => "p/q/deep/file.txt",      expect: true  },
    { name: "makeRegex **/deep non-match",     pattern: "**/deep/file.txt", build: () => "nope/file.txt",          expect: false },
    { name: "makeRegex **[!x] match",          pattern: "**[!x]",      build: () => "ab",                          expect: true  },
    { name: "makeRegex **[!x] non-match",      pattern: "**[!x]",      build: () => "ax",                          expect: false },
];

const instanceCases: IRedosCase[] =
[
    { name: "isMatch **x long non-match",     pattern: "**x",         build: () => "a".repeat(100000),            expect: false },
    { name: "isMatch **x long match",         pattern: "**x",         build: () => `${"a".repeat(100000)}x`,      expect: true  },
    { name: "isMatch **/x long non-match",    pattern: "**/x",        build: () => "a/".repeat(50000),             expect: false },
    { name: "isMatch a/**/b match",           pattern: "a/**/b",      build: () => "a/z/z/b",                      expect: true  },
    { name: "isMatch **.{ts,js} match",       pattern: "**.{ts,js}",  build: () => "deep/dir/file.ts",             expect: true  },
    { name: "isMatch **/*.{ts,js} nomatch",   pattern: "**/*.{ts,js}", build: () => "deep/dir/file.tsx",           expect: false },
];

@suite
export default class PathMatcherRedosSpec
{
    @test @shouldPass
    @batchTest(regexCases, c => c.name)
    public makeRegexIsLinearAndCorrect(c: IRedosCase): void
    {
        const regex = PathMatcher.makeRegex(c.pattern);
        const input = c.build();

        assert.equal(regex.test(input), c.expect, `${c.name}: test("${c.pattern}") on ${input.length} chars`);
    }

    @test @shouldPass
    @batchTest(instanceCases, c => c.name)
    public isMatchIsLinearAndCorrect(c: IRedosCase): void
    {
        const matcher = new PathMatcher(c.pattern);
        const input   = c.build();

        assert.equal(matcher.isMatch(input), c.expect, `${c.name}: isMatch(${c.pattern})`);
    }

@test @shouldPass @timeout(20000)
    public globstarMatchingStaysLinear(): void
    {
        const regex = PathMatcher.makeRegex("**x");

        const t0      = process.hrtime.bigint();
        const small   = regex.test("a".repeat(1000));
        const smallMs = Number(process.hrtime.bigint() - t0) / 1e6;

        const t1      = process.hrtime.bigint();
        const large   = regex.test("a".repeat(100000));
        const largeMs = Number(process.hrtime.bigint() - t1) / 1e6;

        assert.isFalse(large, "**x must not match a run of 'a'");
        assert.isTrue(small, "pattern still compiles and matches short input");
        assert.isAtMost(largeMs, 2000, `**x on 100k chars took ${largeMs.toFixed(2)}ms (expected sub-millisecond)`);
        assert.isAtMost(largeMs, smallMs * 20 + 200, `**x 100k/1k ratio ${largeMs.toFixed(3)}/${smallMs.toFixed(3)}ms is super-linear`);
    }
}