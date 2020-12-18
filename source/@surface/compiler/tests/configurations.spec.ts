import { suite, test } from "@surface/test-suite";
import chai            from "chai";
import
{
    createAnalyzerConfiguration,
    createBuildConfiguration,
    createConfiguration,
    createDevServerConfiguration,
} from "../internal/configurations.js";

@suite
export default class ConfigurationsSpec
{
    @test
    public createAnalyzerConfiguration(): void
    {
        chai.assert.isOk(createAnalyzerConfiguration({ }, { }));
        chai.assert.isOk(createAnalyzerConfiguration({ }, { analyzerMode: "server", mode: "production" }));
    }

    @test
    public createBuildConfiguration(): void
    {
        process.env.SURFACE_ENVIRONMENT = "development";

        chai.assert.isOk(createBuildConfiguration({ }, { }));
        chai.assert.isOk(createBuildConfiguration({ }, { mode: "development" }));
    }

    @test
    public createConfiguration(): void
    {
        chai.assert.isOk(createConfiguration({ }, { }));
        chai.assert.isOk(createConfiguration({ forceTs: true, htmlTemplate: ".", publicPath: "path" }, { mode: "development" }, true));
        chai.assert.isOk(createConfiguration({ forceTs: ["foo", "bar"], htmlTemplate: { template: "." }, publicPath: "/path", webpackConfig: { context: "." } }, { mode: "production", target: "node" }, false));
    }

    @test
    public createDevServerConfiguration(): void
    {
        chai.assert.isOk(createDevServerConfiguration({ },                       { host: "localhost", port: 8080, publicPath: "" }));
        chai.assert.isOk(createDevServerConfiguration({ },                       { host: "localhost", port: 8080, publicPath: "" }));
        chai.assert.isOk(createDevServerConfiguration({ entry: ["."] },          { host: "localhost", port: 8080, publicPath: "" }));
        chai.assert.isOk(createDevServerConfiguration({ entry: { index: "." } }, { host: "localhost", port: 8080, publicPath: "" }));
        chai.assert.isOk(createDevServerConfiguration({ entry: "." },            { host: "localhost", port: 8080, publicPath: "" }));
    }
}