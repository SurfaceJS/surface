/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable array-element-newline */
/* eslint-disable import/no-namespace */

import fs                                                 from "fs";
import Mock                                               from "@surface/mock";
import { afterEach, beforeEach, shouldPass, suite, test } from "@surface/test-suite";
import chai                                               from "chai";
import PreferTsResolvePlugin                              from "../../internal/plugins/prefer-ts-resolve-plugin.js";
import path                                               from "path";

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

type Resolver = Parameters<PreferTsResolvePlugin["apply"]>[0];

const fsMock = Mock.of(fs);

@suite
export default class PreferTsResolvePluginSpec
{
    @beforeEach
    public beforeEach(): void
    {
        fsMock.lock();
    }

    @afterEach
    public afterEach(): void
    {
        fsMock.clear();
    }

    @test @shouldPass
    public apply(): void
    {
        const existsSyncMock = Mock.callable<typeof fs.existsSync>();

        existsSyncMock.call(PATH1_FOO_TS).returns(true);
        existsSyncMock.call(PATH2_FOO_TS).returns(true);

        fsMock.setupGet("existsSync").returns(existsSyncMock.proxy);

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
                    tap(_, callback): void
                    {
                        const payloads = paths.map(path => ({ request: { path }, resolved: "" }));

                        for (const payload of payloads)
                        {
                            callback(payload.request, { });

                            actual.push(payload.request.path);
                        }
                    },
                },
            },
        } as Resolver;

        new PreferTsResolvePlugin().apply(resolver);

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

        chai.assert.deepEqual(actual, expectedForEmpty, "Empty patterns");

        actual = [];

        new PreferTsResolvePlugin(["**/path-1/**/*.js"]).apply(resolver);

        const expectedForNonEmpty =
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

        chai.assert.deepEqual(actual, expectedForNonEmpty, "Non empty patterns");
    }
}