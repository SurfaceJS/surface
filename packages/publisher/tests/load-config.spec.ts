import { join }                                                from "path";
import Mock, { It }                                            from "@surface/mock";
import { afterEach, assert, batchTest, beforeEach, shouldPass, suite } from "@surface/test-suite";
import loadConfig                                              from "../internal/load-config.js";
import { type Scenario, scenarios }                            from "./load-config.scn.js";

const isFileMock   = Mock.callable<(path: string) => Promise<boolean>>();
const readFileMock = Mock.callable<(path: string) => Promise<Buffer>>();

Mock.module("node:fs/promises",
    {
        namedExports:
    {
        readFile: readFileMock.proxy,
    },
    });

Mock.module("@surface/rwx",
    {
        namedExports:
    {
        isFile: isFileMock.proxy,
    },
    });

@suite
export default class LoadConfigSpec
{
    private setupMock(scenario: { path: string, source?: string }): void
    {
        if (scenario.source != undefined)
        {
            isFileMock.call(join(scenario.path, ".npmrc")).resolve(true);
            readFileMock.call(join(scenario.path, ".npmrc")).resolve(Buffer.from(scenario.source));
        }

        isFileMock.call(It.any()).resolve(false);
    }

    @beforeEach
    public beforeEach(): void
    {
        isFileMock.lock();
        readFileMock.lock();
    }

    @afterEach
    public afterEach(): void
    {
        isFileMock.release();
        readFileMock.release();
    }

    @shouldPass
    @batchTest(scenarios, x => x.message, x => x.skip)
    public async getConfig(scenario: Scenario): Promise<void>
    {
        this.setupMock(scenario);

        const actual = await loadConfig(scenario.path, scenario.env);

        assert.deepEqual(actual, scenario.expected);
    }
}