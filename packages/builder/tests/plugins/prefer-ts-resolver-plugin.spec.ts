import path                                               from "path";
import Mock                                               from "@surface/mock";
import { afterEach, assert, beforeEach, shouldPass, suite, test } from "@surface/test-suite";
import type { ResolveContext, ResolveRequest }            from "enhanced-resolve";
import type webpack                                       from "webpack";

const CWD = process.cwd();

const PATH1_BAR_JS = path.join(CWD, "path-1", "bar.js");
const PATH1_BAR_TS = path.join(CWD, "path-1", "bar.ts");
const PATH1_BAZ_TS = path.join(CWD, "path-1", "baz.ts");
const PATH1_FOO    = path.join(CWD, "path-1", "foo");
const PATH1_FOO_JS = path.join(CWD, "path-1", "foo.js");
const PATH1_FOO_TS = path.join(CWD, "path-1", "foo.ts");
const PATH2_BAR_JS = path.join(CWD, "path-2", "bar.js");
const PATH2_BAR_TS = path.join(CWD, "path-2", "bar.ts");
const PATH2_BAZ_TS = path.join(CWD, "path-2", "baz.ts");
const PATH2_FOO    = path.join(CWD, "path-2", "foo");
const PATH2_FOO_JS = path.join(CWD, "path-2", "foo.js");
const PATH2_FOO_TS = path.join(CWD, "path-2", "foo.ts");

type Resolver = webpack.Resolver;

const existsSyncMock = Mock.callable<(path: string) => boolean>();

Mock.module("fs", { namedExports: { existsSync: existsSyncMock.proxy } });

const { default: PreferTsResolverPlugin } = await import("../../internal/plugins/prefer-ts-resolver-plugin.js");

@suite
export default class PreferTsResolverPluginSpec
{
    @beforeEach
    public beforeEach(): void
    {
        existsSyncMock.lock();
    }

    @afterEach
    public afterEach(): void
    {
        existsSyncMock.clear();
    }

    @test @shouldPass
    public apply(): void
    {
        existsSyncMock.call(PATH1_FOO_TS).returns(true);
        existsSyncMock.call(PATH2_FOO_TS).returns(true);

        let actual: string[] = [];

        const paths =
        [
            PATH1_BAR_JS,
            PATH1_BAR_TS,
            PATH1_BAZ_TS,
            PATH1_FOO,
            PATH1_FOO_JS,
            PATH2_BAR_JS,
            PATH2_BAR_TS,
            PATH2_BAZ_TS,
            PATH2_FOO,
            PATH2_FOO_JS,
        ];

        const resolver =
        {
            hooks:
            {
                result:
                {
                    tap(_: string, callback: (request: ResolveRequest, context: ResolveContext) => void): void
                    {
                        const payloads = paths.map(path => ({ request: { path }, resolved: "" }));

                        for (const payload of payloads)
                        {
                            callback(payload.request as ResolveRequest, { });

                            actual.push(payload.request.path);
                        }
                    },
                },
            },
        } as Resolver;

        new PreferTsResolverPlugin().apply(resolver);

        const expectedForEmpty =
        [
            PATH1_BAR_JS,
            PATH1_BAR_TS,
            PATH1_BAZ_TS,
            PATH1_FOO,
            PATH1_FOO_TS,
            PATH2_BAR_JS,
            PATH2_BAR_TS,
            PATH2_BAZ_TS,
            PATH2_FOO,
            PATH2_FOO_TS,
        ];

        assert.deepEqual(actual, expectedForEmpty, "Empty patterns");

        actual = [];

        new PreferTsResolverPlugin(["**/path-1/**/*.js"]).apply(resolver);

        const expectedForRelativePattern =
        [
            PATH1_BAR_JS,
            PATH1_BAR_TS,
            PATH1_BAZ_TS,
            PATH1_FOO,
            PATH1_FOO_TS,
            PATH2_BAR_JS,
            PATH2_BAR_TS,
            PATH2_BAZ_TS,
            PATH2_FOO,
            PATH2_FOO_JS,
        ];

        assert.deepEqual(actual, expectedForRelativePattern, "Relative Pattern");
    }
}
