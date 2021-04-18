import { suite, test }      from "@surface/test-suite";
import chai                 from "chai";
import chaiAsPromised       from "chai-as-promised";
import createConfigurations from "../internal/create-configurations.js";
import type Project         from "../internal/types/project";

chai.use(chaiAsPromised);

@suite
export default class CreateConfigurationsSpec
{
    @test
    public createAnalyzerConfiguration(): void
    {
        void chai.assert.isFulfilled(createConfigurations("analyze", { }));
        void chai.assert.isFulfilled(createConfigurations("analyze", { dependencies: [{ entry: "file.js" }] }));
        void chai.assert.isFulfilled(createConfigurations("analyze", { bundlerAnalyzer: { analyzerPort: "auto" }, dependencies: [{ entry: "file.js" }] }));

        const project: Project =
        {
            bundlerAnalyzer:
            {
                analyzerPort:   8888,
                reportFilename: "app.html",
            },
            dependencies:
            [
                {
                    entry: "file.js",
                    name:  "deps",
                },
            ],
        };

        void chai.assert.isFulfilled(createConfigurations("analyze", project));
    }

    @test
    public createBuildConfiguration(): void
    {
        void chai.assert.isFulfilled(createConfigurations("build", { }));

        const project1: Project =
        {
            htmlTemplate: ".",
            mode:         "development",
            preferTs:     true,
            publicPath:   "path",
        };

        void chai.assert.isFulfilled(createConfigurations("build", project1));

        const project2: Project =
        {
            htmlTemplate: { template: "." },
            includeFiles: ["**/foo", { from: "**/bar", to: "**/baz" }],
            mode:         "production",
            preferTs:     ["foo", "bar"],
            publicPath:   "/path",
            useWorkbox:   true,
            webpack:      { configuration: { context: "." }, mergeRules: { }, postConfiguration: async x => Promise.resolve(x) },
        };

        void chai.assert.isFulfilled(createConfigurations("build", project2));

        const project3: Project =
        {
            dependencies:
            [
                {
                    entry:        "file.js",
                    publicPath:   "/path",
                    webpack:      { configuration: { context: "." } },
                },
            ],
            htmlTemplate: { template: "." },
            includeFiles: ["**/foo", { from: "**/bar", to: "**/baz" }],
            preferTs:     ["foo", "bar"],
            webpack:      { },
        };

        void chai.assert.isFulfilled(createConfigurations("build", project3));
    }

    @test
    public createDevServerConfiguration(): void
    {
        void chai.assert.isFulfilled(createConfigurations("serve", { }));
        void chai.assert.isFulfilled(createConfigurations("serve", { entry: "." }));
        void chai.assert.isFulfilled(createConfigurations("serve", { entry: ["."] }));
        void chai.assert.isFulfilled(createConfigurations("serve", { entry: { index: "." } }));
    }
}