import { URL }         from "url";
import { suite, test } from "@surface/test-suite";
import chai            from "chai";
import chaiAsPromised  from "chai-as-promised";
import
{
    createAnalyzerConfiguration,
    createBuildConfiguration,
    createConfiguration,
    createDevServerConfiguration,
} from "../internal/configurations.js";
import type Configuration from "../internal/types/configuration";

chai.use(chaiAsPromised);

@suite
export default class ConfigurationsSpec
{
    @test
    public createAnalyzerConfiguration(): void
    {
        void chai.assert.isFulfilled(createAnalyzerConfiguration({ }));
        void chai.assert.isFulfilled(createAnalyzerConfiguration({ compilations: [{ }], devServer: { } }));
    }

    @test
    public createBuildConfiguration(): void
    {
        process.env.SURFACE_ENVIRONMENT = "development";

        void chai.assert.isFulfilled(createBuildConfiguration({ }));
        void chai.assert.isFulfilled(createBuildConfiguration({ mode: "development" }));
        void chai.assert.isFulfilled(createBuildConfiguration({ compilations: [{ }] }));
    }

    @test
    public createConfiguration(): void
    {
        void chai.assert.isFulfilled(createConfiguration({ }, { }));

        const configuration2: Configuration =
        {
            forceTs:      true,
            htmlTemplate: ".",
            publicPath:   "path",
        };

        void chai.assert.isFulfilled(createConfiguration(configuration2, { mode: "development" }));

        const configuration3: Configuration =
        {
            copyFiles:     ["**/foo", { from: "**/bar", to: "**/baz" }],
            forceTs:       ["foo", "bar"],
            htmlTemplate:  { template: "." },
            publicPath:    "/path",
            useWorkbox:    true,
            webpack:      { configuration: { context: "." } },
        };

        void chai.assert.isFulfilled(createConfiguration(configuration3, { mode: "production", target: "node" }));

        const configuration4: Configuration =
        {
            compilations:
            [
                {
                    htmlTemplate:  { template: "." },
                    publicPath:    "/path",
                    useWorkbox:    true,
                    webpack:      { configuration: { context: "." } },
                },
            ],
            copyFiles: ["**/foo", { from: "**/bar", to: "**/baz" }],
            forceTs:   ["foo", "bar"],
        };

        void chai.assert.isFulfilled(createConfiguration(configuration4, { mode: "production", target: "node" }));
    }

    @test
    public createDevServerConfiguration(): void
    {
        void chai.assert.isFulfilled(createDevServerConfiguration({ },                                new URL("http://localhost:8080")));
        void chai.assert.isFulfilled(createDevServerConfiguration({ compilations: [{ entry: "." }] }, new URL("http://localhost:8080")));
        void chai.assert.isFulfilled(createDevServerConfiguration({ entry: "." },                     new URL("http://localhost:8080")));
        void chai.assert.isFulfilled(createDevServerConfiguration({ entry: ["."] },                   new URL("http://localhost:8080")));
        void chai.assert.isFulfilled(createDevServerConfiguration({ entry: { index: "." } },          new URL("http://localhost:8080")));
    }
}