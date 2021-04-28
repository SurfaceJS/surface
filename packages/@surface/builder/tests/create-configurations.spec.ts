import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import chaiAsPromised              from "chai-as-promised";
import createConfigurations        from "../internal/create-configurations.js";
import type Configuration          from "../internal/types/configuration";

chai.use(chaiAsPromised);

@suite
export default class CreateConfigurationsSpec
{
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
            hooks:
            {
                configured: async x => Promise.resolve(x),
            },
            main:     "default",
            projects:
            {
                default:
                {
                    index:    "template.html",
                    mode:     "development",
                    preferTs: true,
                    target:   "pwa",
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
        void chai.assert.isNotEmpty(await createConfigurations("serve", { projects: { default: { entry: () => "." } } }));
        void chai.assert.isNotEmpty(await createConfigurations("serve", { projects: { default: { entry: ["."] } } }));
        void chai.assert.isNotEmpty(await createConfigurations("serve", { projects: { default: { entry: { index: "." } } } }));
    }
}