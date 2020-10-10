import { suite, test } from "@surface/test-suite";
import { assert }      from "chai";
import
{
    createAnalyzerConfiguration,
    createBuildConfiguration,
    createConfiguration,
    createDevServerConfiguration,
} from "../internal/configurations";

@suite
export default class ConfigurationsSpec
{
    @test
    public createAnalyzerConfiguration(): void
    {
        assert.isOk(createAnalyzerConfiguration({ }, { }));
        assert.isOk(createAnalyzerConfiguration({ }, { analyzerMode: "server", mode: "production" }));
    }

    @test
    public createBuildConfiguration(): void
    {
        process.env.SURFACE_ENVIRONMENT = "development";

        assert.isOk(createBuildConfiguration({ }, { }));
        assert.isOk(createBuildConfiguration({ }, { mode: "development" }));
    }

    @test
    public createConfiguration(): void
    {
        assert.isOk(createConfiguration({ }, { }));
        assert.isOk(createConfiguration({ forceTs: true, htmlTemplate: ".", publicPath: "path" }, { mode: "development" }, true));
        assert.isOk(createConfiguration({ forceTs: ["foo", "bar"], htmlTemplate: { template: "." }, publicPath: "/path", webpackConfig: { context: "." } }, { mode: "production", target: "node" }, false));
    }

    @test
    public createDevServerConfiguration(): void
    {
        assert.isOk(createDevServerConfiguration({ }, { }));
        assert.isOk(createDevServerConfiguration({ }, { host: "localhost", hot: true, port: 8080 }));
        assert.isOk(createDevServerConfiguration({ entry: ["."] }, { }));
        assert.isOk(createDevServerConfiguration({ entry: { index: "." } }, { }));
        assert.isOk(createDevServerConfiguration({ entry: "." }, { }));
    }
}