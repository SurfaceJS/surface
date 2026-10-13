import { assert, batchTest, shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import PathMatcher                                        from "../internal/path-matcher.js";

interface MatcherScenario
{
    patterns:   string | string[];
    options?:   { base?: string, unix?: boolean };

    matches:    string[];
    mismatches: string[];
}

const matcherScenarios: MatcherScenario[] =
[
    {
        patterns:   "foo/**",
        matches:    ["/foo/bar", "/foo/baz/qux"],
        mismatches: ["/bar", "/foo2"],
    },
    {
        patterns:   "src/**/*.ts",
        options:    { base: "/home/user/project" },
        matches:    ["/home/user/project/src/index.ts", "/home/user/project/src/deep/nested/file.ts"],
        mismatches: ["/home/user/project/src/index.js", "/home/user/project/other/file.ts"],
    },
    {
        patterns:   "!**/node_modules/**",
        matches:    ["/app/src/index.ts"],
        mismatches: ["/app/node_modules/lodash/index.js"],
    },
    {
        patterns:   "file.ts",
        matches:    ["/foo/file.ts"],
        mismatches: ["/foo/file2.ts", "/other/file.ts"],
    },
    {
        patterns:   "**x",
        matches:    ["/ax"],
        mismatches: ["a".repeat(120)],
    },
];

@suite
export default class PathMatcherInstanceSpec
{
    @test @shouldPass
    public singleInclude(): void
    {
        const matcher = new PathMatcher("foo/**");

        assert.isTrue(matcher.paths.has("foo"), "paths should contain the include path");
        assert.isFalse(matcher.negatedPaths.has("foo"), "negatedPaths should not contain an included path");
        assert.isTrue(matcher.isMatch("/foo/bar"), "isMatch('/foo/bar') should be true");
        assert.isFalse(matcher.isMatch("/bar"), "isMatch('/bar') should be false");
    }

    @test @shouldPass
    public negatedPattern(): void
    {
        const matcher = new PathMatcher("!foo/**", { base: "/" });

        assert.isTrue(matcher.negatedPaths.has("/foo"), "negatedPaths should contain the negated path");
        assert.isFalse(matcher.paths.has("/foo"), "paths should not contain a negated path");
    }

    @test @shouldPass
    public patternArray(): void
    {
        const matcher = new PathMatcher(["a/**/*.js", "!a/**/.gitignore"], { base: "/" });

        assert.isTrue(matcher.paths.has("/a"), "paths should contain the include base");
        assert.isTrue(matcher.negatedPaths.has("/a"), "negatedPaths should contain the negated base");
    }

    @test @shouldPass
    public withBaseOption(): void
    {
        const matcher = new PathMatcher("src/**/*.ts", { base: "/home/user/project" });

        assert.isTrue(matcher.isMatch("/home/user/project/src/index.ts"), "should match path under base/src");
        assert.isFalse(matcher.isMatch("/home/user/project/src/index.js"), "should not match a .js file");
    }

    @test @shouldPass
    @batchTest(
        matcherScenarios,
        x => `isMatch with patterns [${JSON.stringify(x.patterns)}]`,
    )
    public isMatchMatchesAndMismatches(scenario: MatcherScenario): void
    {
        const matcher = new PathMatcher(scenario.patterns, scenario.options ?? {});

        for (const path of scenario.matches)
        {
            assert.isTrue(matcher.isMatch(path), `isMatch("${path}") should be true`);
        }

        for (const path of scenario.mismatches)
        {
            assert.isFalse(matcher.isMatch(path), `isMatch("${path}") should be false`);
        }
    }

    @test @shouldPass
    public negationExcludesMatch(): void
    {
        const matcher = new PathMatcher(["src/**", "!src/generated/**"], { base: "/app" });

        assert.isTrue(matcher.isMatch("/app/src/index.ts"), "should match include path");
        assert.isFalse(matcher.isMatch("/app/src/generated/foo.ts"), "should not match excluded path");
    }

    @test @shouldFail
    public invalidPattern(): void
    {
        /* eslint-disable-next-line no-new */
        new PathMatcher("{invalid", { base: "/" });
    }
}
