import { lookup }                                         from "@surface/io";
import Mock, { It }                                       from "@surface/mock";
import { afterEach, beforeEach, shouldPass, suite, test } from "@surface/test-suite";
import chai                                               from "chai";
import chaiAsPromised                                     from "chai-as-promised";
import createConfigurations                               from "../internal/create-configurations.js";
import type Configuration                                 from "../internal/types/configuration";

chai.use(chaiAsPromised);

const lookupMock = Mock.of(lookup)!;

@suite
export default class CreateConfigurationsSpec
{
    @beforeEach
    public beforeEach(): void
    {
        lookupMock.lock();
        lookupMock.call(It.any(), It.any()).returns("node_modules");
    }

    @afterEach
    public afterEach(): void
    {
        lookupMock.release();
    }

    @test @shouldPass
    public async createAnalyzerConfiguration(): Promise<void>
    {
        void chai.assert.isNotEmpty(await createConfigurations("analyze", { }));
        void chai.assert.isNotEmpty(await createConfigurations("analyze", { projects: { default: { analyzer: { reportFilename: "analyzer.html" } } } }));
    }

    @test @shouldPass
    public async createBuildConfiguration(): Promise<void>
    {
        void chai.assert.isFulfilled(createConfigurations("build", { }));

        const configuration: Configuration =
        {
            clean: true,
            hooks:
            {
                configured: async x => Promise.resolve(x),
            },
            main:     "default",
            projects:
            {
                default:
                {
                    dependencies: ["webworker"],
                    environments:
                    {
                        production:
                        {
                            overrides:
                            [
                                {
                                    replace: "foo",
                                    with:    "bar",
                                },
                            ],
                            variables: ["Foo", "Bar"],
                        },
                    },
                    eslint:                 { enabled: true },
                    index:                  "template.html",
                    mode:                   "production",
                    preferTs:               true,
                    target:                 "pwa",
                    templateExpressionMode: "aot",
                },
                empty:
                {
                    eslint: undefined,
                    mode:   undefined,
                },
                webworker:
                {
                    includeFiles: ["**/foo", { from: "**/bar", to: "**/baz" }],
                    mode:         "production",
                    preferTs:     ["**/foo", "**/bar"],
                    target:       "webworker",
                },
            },
        };

        void chai.assert.isNotEmpty(await createConfigurations("build", configuration));
    }

    @test @shouldPass
    public async createDevServerConfiguration(): Promise<void>
    {
        void chai.assert.isNotEmpty(await createConfigurations("serve", { }));
        void chai.assert.isNotEmpty(await createConfigurations("serve", { projects: { default: { entry: "." } } }));
        void chai.assert.isNotEmpty(await createConfigurations("serve", { projects: { default: { entry: ["."] } } }));
        void chai.assert.isNotEmpty(await createConfigurations("serve", { projects: { default: { entry: { index: "." } } } }));
    }
}