import { readFile }                                                   from "fs/promises";
import { join }                                                       from "path";
import { isFile }                                                     from "@surface/io";
import Mock, { It }                                                   from "@surface/mock";
import { afterEach, batchTest, beforeEach, shouldPass, suite }        from "@surface/test-suite";
import chai                                                           from "chai";
import NpmConfig                                                      from "../internal/npm-config.js";
import { type AuthScenario, type Scenario, authScenarios, scenarios } from "./npm-config.scn.js";

const isFileMock   = Mock.of(isFile);
const readFileMock = Mock.of(readFile);

@suite
export default class NpmConfigSpec
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

        const config = await NpmConfig.load(scenario.path, scenario.env);

        // @ts-ignore
        const actual = config?.entries;

        chai.assert.deepEqual(actual, scenario.expected);
    }

    @shouldPass
    @batchTest(authScenarios, x => x.message, x => x.skip)
    public async getAuth(scenario: AuthScenario): Promise<void>
    {
        this.setupMock(scenario);

        const config = await NpmConfig.load(scenario.path, { });

        const actual = { registry: config!.registry, authToken: config!.authToken, scopedAuth: config!.getScopedAuth(scenario.scope) };

        chai.assert.deepEqual(actual, scenario.expected);
        chai.assert.deepEqual(config!.getScopedAuth(scenario.scope), scenario.expected.scopedAuth); // Cache
    }
}
