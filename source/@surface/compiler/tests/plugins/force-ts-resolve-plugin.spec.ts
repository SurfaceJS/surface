/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable array-element-newline */
/* eslint-disable import/no-namespace */

import fs                                                 from "fs";
import Mock                                               from "@surface/mock";
import { afterEach, beforeEach, shouldPass, suite, test } from "@surface/test-suite";
import chai                                               from "chai";
import ForceTsResolvePlugin                               from "../../internal/plugins/force-ts-resolve-plugin.js";

const fsMock = Mock.of(fs)!;

@suite
export default class ForceTsResolvePluginSpec
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

        existsSyncMock.call("path-1/foo.ts").returns(true);
        existsSyncMock.call("path-2/foo.ts").returns(true);
        existsSyncMock.call("path-1/bar.ts").returns(false);
        existsSyncMock.call("path-2/bar.ts").returns(false);

        fsMock.setupGet("existsSync").returns(existsSyncMock.proxy);

        const resolver =
        {
            hooks:
            {
                resolved:
                {
                    tap(_: string, callback: (request: { path: string }) => void): void
                    {
                        callback({ path: "path-1/foo" });
                        callback({ path: "path-1/foo.js" });
                        callback({ path: "path-1/bar.js" });
                        callback({ path: "path-1/baz.ts" });
                        callback({ path: "path-2/foo" });
                    },
                },
            },
        };

        chai.assert.doesNotThrow(() => new ForceTsResolvePlugin().apply(resolver));
        chai.assert.doesNotThrow(() => new ForceTsResolvePlugin(["path-2"]).apply(resolver));
    }
}