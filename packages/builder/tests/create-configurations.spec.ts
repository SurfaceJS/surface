import { shouldPass, suite, test } from "@surface/test-suite";
import { assert, use }             from "chai";
import chaiAsPromised              from "chai-as-promised";
import createConfigurations        from "../internal/create-configurations.js";
import type Configuration          from "../internal/types/configuration.js";

use(chaiAsPromised);

@suite
export default class CreateConfigurationsSpec
{
    @test @shouldPass
    public async createAnalyzerConfiguration(): Promise<void>
    {
        void assert.isNotEmpty(await createConfigurations("analyze", { }));
        void assert.isNotEmpty(await createConfigurations("analyze", { projects: { default: { analyzer: { reportFilename: "analyzer.html" } } } }));
    }

    @test @shouldPass
    public async createBuildConfiguration(): Promise<void>
    {
        void assert.isFulfilled(createConfigurations("build", { }));

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
                    eslint:   { enabled: true },
                    htmlx:    { attributeHandlers: [], mode: "aot" },
                    index:    "template.html",
                    mode:     "production",
                    preferTs: true,
                    target:   "pwa",
                },
                empty:
                {
                    eslint: undefined,
                    htmlx:  "aot",
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

        await assert.isFulfilled(createConfigurations("build", configuration));
    }

    @test @shouldPass
    public async createDevServerConfiguration(): Promise<void>
    {
        await assert.isFulfilled(createConfigurations("serve", { }));
        await assert.isFulfilled(createConfigurations("serve", { projects: { default: { entry: "." } } }));
        await assert.isFulfilled(createConfigurations("serve", { projects: { default: { entry: ["."] } } }));
        await assert.isFulfilled(createConfigurations("serve", { projects: { default: { entry: { index: "." } } } }));
    }
}
