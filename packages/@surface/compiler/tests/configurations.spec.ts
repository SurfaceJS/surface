import { URL }         from "url";
import { suite, test } from "@surface/test-suite";
import chai            from "chai";
import
{
    createAnalyzerConfiguration,
    createBuildConfiguration,
    createConfiguration,
    createDevServerConfiguration,
} from "../internal/configurations.js";
import type Configuration from "../internal/types/configuration";

@suite
export default class ConfigurationsSpec
{
    @test
    public createAnalyzerConfiguration(): void
    {
        chai.assert.isOk(createAnalyzerConfiguration({ }, { }));
        chai.assert.isOk(createAnalyzerConfiguration({ compilations: [{ entry: "index.ts" }] }, { analyzerMode: "server", mode: "production" }));
    }

    @test
    public createBuildConfiguration(): void
    {
        process.env.SURFACE_ENVIRONMENT = "development";

        chai.assert.isOk(createBuildConfiguration({ }, { }));
        chai.assert.isOk(createBuildConfiguration({ compilations: [{ entry: "index.ts" }] }, { mode: "development" }));
    }

    @test
    public createConfiguration(): void
    {
        chai.assert.isOk(createConfiguration({ }, { }));

        const configuration1: Configuration =
        {
            forceTs:      true,
            htmlTemplate: ".",
            publicPath:   "path",
        };

        chai.assert.isOk(createConfiguration(configuration1, { mode: "development" }));

        const configuration2: Configuration =
        {
            copyFiles:     ["**/foo", { from: "**/bar", to: "**/baz" }],
            forceTs:       ["foo", "bar"],
            htmlTemplate:  { template: "." },
            publicPath:    "/path",
            webpackConfig: { context: "." },
        };

        chai.assert.isOk(createConfiguration(configuration2, { mode: "production", target: "node" }));
    }

    @test
    public createDevServerConfiguration(): void
    {
        chai.assert.isOk(createDevServerConfiguration({ },                                       new URL("http://localhost:8080")));
        chai.assert.isOk(createDevServerConfiguration({ compilations: [{ entry: "index.ts" }] }, new URL("http://localhost:8080")));
        chai.assert.isOk(createDevServerConfiguration({ entry: ["."] },                          new URL("http://localhost:8080")));
        chai.assert.isOk(createDevServerConfiguration({ entry: { index: "." } },                 new URL("http://localhost:8080")));
        chai.assert.isOk(createDevServerConfiguration({ entry: "." },                            new URL("http://localhost:8080")));
    }
}