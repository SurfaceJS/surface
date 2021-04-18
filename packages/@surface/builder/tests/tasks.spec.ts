/* eslint-disable max-lines-per-function */
import path                                    from "path";
import { isFile, lookupFile, removePathAsync } from "@surface/io";
import Mock, { It }                            from "@surface/mock";
import { afterEach, beforeEach, suite, test }  from "@surface/test-suite";
import chai                                    from "chai";
import type webpack                            from "webpack";
import Builder                                 from "../internal/builder.js";
import { loadModule }                          from "../internal/common.js";
import Tasks                                   from "../internal/tasks.js";
import type CliDevServerOptions                from "../internal/types/cli-dev-serve-options";
import type CliOptions                         from "../internal/types/cli-options";
import type Project                            from "../internal/types/project";

const CWD = process.cwd();

const isFileMock          = Mock.of(isFile);
const lookupFileMock      = Mock.of(lookupFile);
const removePathAsyncMock = Mock.of(removePathAsync);
const compilerCtorMock    = Mock.of(Builder);
const loadModuleMock      = Mock.of(loadModule);

const CWD_BUILD                                                                  = path.join(CWD, "build");
const CWD_PROJECT                                                                = path.join(CWD, "project");
const CWD_PROJECT_BUILD                                                          = path.join(CWD, "project", "build");
const CWD_PROJECT_ESLINTRC_JS                                                    = path.join(CWD, "project", ".eslintrc.js");
const CWD_PROJECT_ESLINTRC_JSON                                                  = path.join(CWD, "project", ".eslintrc.json");
const CWD_PROJECT_ESLINTRC_YAML                                                  = path.join(CWD, "project", ".eslintrc.yaml");
const CWD_PROJECT_ESLINTRC_YML                                                   = path.join(CWD, "project", ".eslintrc.yml");
const CWD_PROJECT_NO_ESLINTRC                                                    = path.join(CWD, "project-no-eslintrc");
const CWD_PROJECT_NO_ESLINTRC_BUILD                                              = path.join(CWD, "project-no-eslintrc", "build");
const CWD_PROJECT_NO_ESLINTRC_SURFACE_JSON                                       = path.join(CWD, "project-no-eslintrc", "surface.json");
const CWD_PROJECT_NO_ESLINTRC_TSCONFIG_JSON                                      = path.join(CWD, "project-no-eslintrc", "tsconfig.json");
const CWD_PROJECT_SURFACE_DEVELOPMENT_JS                                         = path.join(CWD, "project", "surface.development.js");
const CWD_PROJECT_SURFACE_DEVELOPMENT_JSON                                       = path.join(CWD, "project", "surface.development.json");
const CWD_PROJECT_SURFACE_JS                                                     = path.join(CWD, "project", "surface.js");
const CWD_PROJECT_SURFACE_JSON                                                   = path.join(CWD, "project", "surface.json");
const CWD_PROJECT_TSCONFIG_JSON                                                  = path.join(CWD, "project", "tsconfig.json");
const CWD_PROJECT_WEBPACK_CONFIG_JS                                              = path.join(CWD, "project", "webpack.config.js");
const CWD_PROJECT_WITH_DEPENDENCIES                                              = path.join(CWD, "project-with-dependencies");
const CWD_PROJECT_WITH_DEPENDENCIES_BUILD                                        = path.join(CWD, "project-with-dependencies", "build");
const CWD_PROJECT_WITH_DEPENDENCIES_SURFACE_JSON                                 = path.join(CWD, "project-with-dependencies", "surface.json");
const CWD_PROJECT_WITH_DEPENDENCIES_TSCONFIG_JSON                                = path.join(CWD, "project-with-dependencies", "tsconfig.json");
const CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION                               = path.join(CWD, "project-with-extra-configuration");
const CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_BUILD                         = path.join(CWD, "project-with-extra-configuration", "build");
const CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_SURFACE_JSON                  = path.join(CWD, "project-with-extra-configuration", "surface.json");
const CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_TSCONFIG_JSON                 = path.join(CWD, "project-with-extra-configuration", "tsconfig.json");
const CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_WEBPACK_CONFIGURATION_JS      = path.join(CWD, "project-with-extra-configuration", "webpack-configuration.js");
const CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_WEBPACK_POST_CONFIGURATION_JS = path.join(CWD, "project-with-extra-configuration", "webpack-post-configuration.js");
const CWD_TSCONFIG_JSON                                                          = path.join(CWD, "tsconfig.json");

const DEFAULTS: Required<Pick<Project, "context" | "entry" | "filename" | "publicPath" | "output" | "tsconfig">> =
{
    context:    CWD,
    entry:      "./source/index.ts",
    filename:   "[name].js",
    output:     CWD_BUILD,
    publicPath: "/",
    tsconfig:   CWD_TSCONFIG_JSON,
};

const postConfiguration = async (x: webpack.Configuration): Promise<webpack.Configuration> => Promise.resolve(x);

@suite
export default class TasksSpec
{
    @beforeEach
    public beforeEach(): void
    {
        isFileMock.lock();
        lookupFileMock.lock();
        loadModuleMock.lock();
        removePathAsyncMock.lock();

        isFileMock.call(CWD_PROJECT_NO_ESLINTRC_SURFACE_JSON).returns(true);
        isFileMock.call(CWD_PROJECT_SURFACE_DEVELOPMENT_JS).returns(true);
        isFileMock.call(CWD_PROJECT_SURFACE_DEVELOPMENT_JSON).returns(true);
        isFileMock.call(CWD_PROJECT_SURFACE_JS).returns(true);
        isFileMock.call(CWD_PROJECT_SURFACE_JSON).returns(true);
        isFileMock.call(CWD_PROJECT_WITH_DEPENDENCIES_SURFACE_JSON).returns(true);
        isFileMock.call(CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_SURFACE_JSON).returns(true);

        lookupFileMock
            .call
            ([
                CWD_PROJECT_SURFACE_DEVELOPMENT_JS,
                CWD_PROJECT_SURFACE_DEVELOPMENT_JSON,
                CWD_PROJECT_SURFACE_JS,
                CWD_PROJECT_SURFACE_JSON,
            ])
            .returns(CWD_PROJECT_SURFACE_JSON);

        lookupFileMock
            .call
            ([
                CWD_PROJECT_ESLINTRC_JS,
                CWD_PROJECT_ESLINTRC_JSON,
                CWD_PROJECT_ESLINTRC_YML,
                CWD_PROJECT_ESLINTRC_YAML,
            ])
            .returns(CWD_PROJECT_ESLINTRC_JSON);

        loadModuleMock
            .call(CWD_PROJECT_SURFACE_JS)
            .returns
            (
                Promise.resolve
                ({
                    context:  CWD_PROJECT,
                    entry:    "./source/index.ts",
                    filename: "index.js",
                    output:   path.join(CWD_PROJECT, "./www"),
                    tsconfig: path.join(CWD_PROJECT, "./base.tsconfig.json"),
                }),
            );

        loadModuleMock
            .call(CWD_PROJECT_SURFACE_JSON)
            .returns(Promise.resolve({ preferTs: ["foo", "bar"] }));

        loadModuleMock
            .call(CWD_PROJECT_SURFACE_DEVELOPMENT_JSON)
            .returns(Promise.resolve({ eslintrc: CWD_PROJECT_ESLINTRC_JSON, preferTs: true }));

        loadModuleMock
            .call(CWD_PROJECT_NO_ESLINTRC_SURFACE_JSON)
            .returns(Promise.resolve({ }));

        loadModuleMock
            .call(CWD_PROJECT_WEBPACK_CONFIG_JS)
            .returns(Promise.resolve({ "__esModule": true, default: { } }));

        loadModuleMock
            .call(CWD_PROJECT_WITH_DEPENDENCIES_SURFACE_JSON)
            .returns(Promise.resolve({ "__esModule": true, default: { dependencies: [{ entry: "file-1.js" }, { entry: "file-2.js" }] } }));

        loadModuleMock
            .call(CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_SURFACE_JSON)
            .returns
            (
                Promise.resolve
                ({
                    "__esModule": true,
                    default:
                    {
                        dependencies:
                        [
                            {
                                entry:   "file.js",
                                webpack:
                                {
                                    configuration:     "./webpack-configuration.js",
                                    postConfiguration: "./webpack-post-configuration.js",
                                },
                            },
                        ],
                        webpack:
                        {
                            configuration:     "./webpack-configuration.js",
                            postConfiguration: "./webpack-post-configuration.js",
                        },
                    },
                }),
            );

        loadModuleMock
            .call(CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_WEBPACK_CONFIGURATION_JS)
            .returns(Promise.resolve({ "__esModule": true, default: { } }));

        loadModuleMock
            .call(CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_WEBPACK_POST_CONFIGURATION_JS)
            .returns(Promise.resolve({ "__esModule": true, default: postConfiguration }));

        removePathAsyncMock.call(It.any());
    }

    @afterEach
    public afterEach(): void
    {
        compilerCtorMock.release();
        isFileMock.release();
        loadModuleMock.release();
        lookupFileMock.release();
        removePathAsyncMock.release();
    }

    @test
    public async analyze(): Promise<void>
    {

        const expected: Project = { ...DEFAULTS, bundlerAnalyzer: { analyzerMode: "static", logLevel: "silent" } };

        let actual: Project;

        compilerCtorMock
            .setup("analyze")
            .call(It.any())
            .callback(x => actual = x)
            .returns(Promise.resolve());

        await Tasks.analyze({ }),

        chai.assert.deepEqual(actual!, expected);
    }

    @test
    public async build(): Promise<void>
    {
        const expectedRun: Project = { ...DEFAULTS, mode: "development" };

        let actualRun: Project;

        compilerCtorMock
            .setup("run")
            .call(It.any())
            .callback(x => actualRun = x)
            .returns(Promise.resolve());

        await Tasks.build({ mode: "development" }),

        chai.assert.deepEqual(actualRun!, expectedRun, "actualRun deep equal to expectedRun");

        const expectedRunWithProject: Project =
        {
            ...DEFAULTS,
            context:    CWD_PROJECT,
            eslintrc:   CWD_PROJECT_ESLINTRC_JSON,
            output:     CWD_PROJECT_BUILD,
            preferTs:   true,
            tsconfig:   CWD_PROJECT_TSCONFIG_JSON,
            webpack:    { },
        };

        let actualRunWithProject: Project;

        compilerCtorMock
            .setup("run")
            .call(It.any())
            .callback(x => actualRunWithProject = x)
            .returns(Promise.resolve());

        await Tasks.build({ project: CWD_PROJECT_SURFACE_DEVELOPMENT_JSON }),

        chai.assert.deepEqual(actualRunWithProject!, expectedRunWithProject, "actualRunWithProject deep equal to expectedRunWithProject");

        const expectedRunWithNoEsLintProject: Project =
        {
            ...DEFAULTS,
            context:  CWD_PROJECT_NO_ESLINTRC,
            output:   CWD_PROJECT_NO_ESLINTRC_BUILD,
            tsconfig: CWD_PROJECT_NO_ESLINTRC_TSCONFIG_JSON,
            webpack:  { configuration: { } },
        };

        let actualRunWithNoEsLintProject: Project;

        compilerCtorMock
            .setup("run")
            .call(It.any())
            .callback(x => actualRunWithNoEsLintProject = x)
            .returns(Promise.resolve());

        await Tasks.build({ project: CWD_PROJECT_NO_ESLINTRC_SURFACE_JSON, webpackConfiguration: CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_WEBPACK_CONFIGURATION_JS }),

        chai.assert.deepEqual(actualRunWithNoEsLintProject!, expectedRunWithNoEsLintProject, "actualRunWithNoEsLintProject deep equal to expectedRunWithNoEsLintProject");

        const expectedRunWithDependencies: Project =
        {
            ...DEFAULTS,
            context:      CWD_PROJECT_WITH_DEPENDENCIES,
            dependencies:
            [
                {
                    ...DEFAULTS,
                    context:  CWD_PROJECT_WITH_DEPENDENCIES,
                    entry:    "file-1.js",
                    output:   CWD_PROJECT_WITH_DEPENDENCIES_BUILD,
                    tsconfig: CWD_PROJECT_WITH_DEPENDENCIES_TSCONFIG_JSON,
                },
                {
                    ...DEFAULTS,
                    context:  CWD_PROJECT_WITH_DEPENDENCIES,
                    entry:    "file-2.js",
                    output:   CWD_PROJECT_WITH_DEPENDENCIES_BUILD,
                    tsconfig: CWD_PROJECT_WITH_DEPENDENCIES_TSCONFIG_JSON,
                },
            ],
            output:   CWD_PROJECT_WITH_DEPENDENCIES_BUILD,
            tsconfig: CWD_PROJECT_WITH_DEPENDENCIES_TSCONFIG_JSON,
            webpack:  { postConfiguration },
        };

        let actualRunWithDependencies: Project;

        compilerCtorMock
            .setup("run")
            .call(It.any())
            .callback(x => actualRunWithDependencies = x)
            .returns(Promise.resolve());

        await Tasks.build({ project: CWD_PROJECT_WITH_DEPENDENCIES_SURFACE_JSON, webpackPostConfiguration: CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_WEBPACK_POST_CONFIGURATION_JS }),

        chai.assert.deepEqual(actualRunWithDependencies!, expectedRunWithDependencies, "actualRunWithNoEsLintProject deep equal to expectedRunWithDependencies");

        const expectedRunWithExtraWebpackConfigurationFile: Project =
        {
            ...DEFAULTS,
            context:      CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION,
            dependencies:
            [
                {
                    ...DEFAULTS,
                    context:  CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION,
                    entry:    "file.js",
                    output:   CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_BUILD,
                    tsconfig: CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_TSCONFIG_JSON,
                    webpack:
                    {
                        configuration: { },
                        postConfiguration,
                    },
                },
            ],
            output:   CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_BUILD,
            tsconfig: CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_TSCONFIG_JSON,
            webpack:
            {
                configuration: { },
                postConfiguration,
            },
        };

        let actualRunWithExtraWebpackConfigurationFile: Project;

        compilerCtorMock
            .setup("run")
            .call(It.any())
            .callback(x => actualRunWithExtraWebpackConfigurationFile = x)
            .returns(Promise.resolve());

        await Tasks.build({ project: CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_SURFACE_JSON }),

        chai.assert.deepEqual(actualRunWithExtraWebpackConfigurationFile!, expectedRunWithExtraWebpackConfigurationFile, "actualRunWithExtraWebpackConfigurationFile deep equal to expectedRunWithExtraWebpackConfigurationFile");

        const expectedWatch: Project =
        {
            ...DEFAULTS,
            context:  CWD_PROJECT,
            entry:    "./source/index.ts",
            eslintrc: CWD_PROJECT_ESLINTRC_JSON,
            filename: "index.js",
            output:   path.join(CWD_PROJECT, "./www"),
            tsconfig: path.join(CWD_PROJECT, "./base.tsconfig.json"),
            webpack:  { },
        };

        let actualWatch: Project;

        compilerCtorMock
            .setup("watch")
            .call(It.any())
            .callback(x => actualWatch = x)
            .returns(Promise.resolve({ close: async () => Promise.resolve() }));

        await Tasks.build({ project: CWD_PROJECT_SURFACE_JS, watch: true }),

        chai.assert.deepEqual(actualWatch!, expectedWatch, "actualWatch deep equal to expectedWatch");
    }

    @test
    public async serve(): Promise<void>
    {
        const expected: Project =
        {
            context:    CWD_PROJECT,
            devServer:
            {
                stats:
                {
                    assets:       true,
                    children:     true,
                    colors:       true,
                    errorDetails: false,
                    errors:       true,
                    logging:      "info",
                    modules:      true,
                    version:      true,
                    warnings:     true,
                },
            },
            entry:      "./source/index.ts",
            eslintrc:   CWD_PROJECT_ESLINTRC_JSON,
            filename:   "[name].js",
            output:     CWD_PROJECT_BUILD,
            preferTs:   [path.join(CWD_PROJECT, "foo"), path.join(CWD_PROJECT, "bar")],
            publicPath: "/",
            tsconfig:   CWD_PROJECT_TSCONFIG_JSON,
            webpack:    { configuration: { } },
        };

        let actual: Project;

        compilerCtorMock
            .setup("serve")
            .call(It.any())
            .callback(x => actual = x)
            .returns(Promise.resolve({ close: async () => Promise.resolve() }));

        const configuration: CliOptions & CliDevServerOptions =
        {
            eslintrc:             CWD_PROJECT_ESLINTRC_JSON,
            project:              "project",
            webpackConfiguration: CWD_PROJECT_WEBPACK_CONFIG_JS,
        };

        await Tasks.serve(configuration),

        chai.assert.deepEqual(actual!, expected);
    }
}