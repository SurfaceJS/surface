/* eslint-disable max-lines-per-function */
import path                                    from "path";
import { isFile, lookupFile, removePathAsync } from "@surface/io";
import Mock, { It }                            from "@surface/mock";
import { afterEach, beforeEach, suite, test }  from "@surface/test-suite";
import chai                                    from "chai";
import type webpack                            from "webpack";
import { loadModule }                          from "../internal/common.js";
import Compiler                                from "../internal/compiler.js";
import Tasks                                   from "../internal/tasks.js";
import type CliAnalyzerOptions                 from "../internal/types/cli-analyzer-options";
import type CliBuildOptions                    from "../internal/types/cli-build-options";
import type CliDevServerOptions                from "../internal/types/cli-dev-serve-options";
import type CliOptions                         from "../internal/types/cli-options";
import type Configuration                      from "../internal/types/configuration";

const CWD = process.cwd();

const isFileMock          = Mock.of(isFile)!;
const lookupFileMock      = Mock.of(lookupFile)!;
const removePathAsyncMock = Mock.of(removePathAsync)!;
const compilerCtorMock    = Mock.of(Compiler)!;
const loadModuleMock      = Mock.of(loadModule)!;

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
const CWD_PROJECT_WITH_COMPILATIONS                                              = path.join(CWD, "project-with-compilations");
const CWD_PROJECT_WITH_COMPILATIONS_BUILD                                        = path.join(CWD, "project-with-compilations", "build");
const CWD_PROJECT_WITH_COMPILATIONS_SURFACE_JSON                                 = path.join(CWD, "project-with-compilations", "surface.json");
const CWD_PROJECT_WITH_COMPILATIONS_TSCONFIG_JSON                                = path.join(CWD, "project-with-compilations", "tsconfig.json");
const CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION                               = path.join(CWD, "project-with-extra-configuration");
const CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_BUILD                         = path.join(CWD, "project-with-extra-configuration", "build");
const CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_SURFACE_JSON                  = path.join(CWD, "project-with-extra-configuration", "surface.json");
const CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_TSCONFIG_JSON                 = path.join(CWD, "project-with-extra-configuration", "tsconfig.json");
const CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_WEBPACK_CONFIGURATION_JS      = path.join(CWD, "project-with-extra-configuration", "webpack-configuration.js");
const CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_WEBPACK_POST_CONFIGURATION_JS = path.join(CWD, "project-with-extra-configuration", "webpack-post-configuration.js");
const CWD_TSCONFIG_JSON                                                          = path.join(CWD, "tsconfig.json");

const DEFAULTS: Required<Pick<Configuration, "context" | "entry" | "filename" | "publicPath" | "output" | "tsconfig">> =
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
        isFileMock.call(CWD_PROJECT_WITH_COMPILATIONS_SURFACE_JSON).returns(true);
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
            .returns(Promise.resolve({ forceTs: ["foo", "bar"] }));

        loadModuleMock
            .call(CWD_PROJECT_SURFACE_DEVELOPMENT_JSON)
            .returns(Promise.resolve({ eslintrc: CWD_PROJECT_ESLINTRC_JSON, forceTs: true }));

        loadModuleMock
            .call(CWD_PROJECT_NO_ESLINTRC_SURFACE_JSON)
            .returns(Promise.resolve({ }));

        loadModuleMock
            .call(CWD_PROJECT_WEBPACK_CONFIG_JS)
            .returns(Promise.resolve({ "__esModule": true, default: { } }));

        loadModuleMock
            .call(CWD_PROJECT_WITH_COMPILATIONS_SURFACE_JSON)
            .returns(Promise.resolve({ "__esModule": true, default: { compilations: [{ entry: "file-1.js" }, { entry: "file-2.js" }] } }));

        loadModuleMock
            .call(CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_SURFACE_JSON)
            .returns
            (
                Promise.resolve
                ({
                    "__esModule": true,
                    default:
                    {
                        compilations:
                        [
                            {
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
        type Args = [Configuration, CliAnalyzerOptions];

        const expected: Args = [DEFAULTS, { }];

        let actual: Args;

        compilerCtorMock
            .setup("analyze")
            .call(It.any(), It.any())
            .callback((...x) => actual = x)
            .returns(Promise.resolve());

        await Tasks.analyze({ }),

        chai.assert.deepEqual(actual!, expected);
    }

    @test
    public async build(): Promise<void>
    {
        type Args = [Configuration, CliBuildOptions];

        const expectedRun: Args =
        [
            DEFAULTS,
            { mode: "development" },
        ];

        let actualRun: Args;

        compilerCtorMock
            .setup("run")
            .call(It.any(), It.any())
            .callback((...x) => actualRun = x)
            .returns(Promise.resolve());

        await Tasks.build({ mode: "development" }),

        chai.assert.deepEqual(actualRun!, expectedRun, "actualRun deep equal to expectedRun");

        const expectedRunWithProject: Args =
        [
            {
                ...DEFAULTS,
                context:    CWD_PROJECT,
                eslintrc:   CWD_PROJECT_ESLINTRC_JSON,
                forceTs:    true,
                output:     CWD_PROJECT_BUILD,
                tsconfig:   CWD_PROJECT_TSCONFIG_JSON,
                webpack:    { },
            },
            { },
        ];

        let actualRunWithProject: Args;

        compilerCtorMock
            .setup("run")
            .call(It.any(), It.any())
            .callback((...x) => actualRunWithProject = x)
            .returns(Promise.resolve());

        await Tasks.build({ project: CWD_PROJECT_SURFACE_DEVELOPMENT_JSON }),

        chai.assert.deepEqual(actualRunWithProject!, expectedRunWithProject, "actualRunWithProject deep equal to expectedRunWithProject");

        const expectedRunWithNoEsLintProject: Args =
        [
            {
                ...DEFAULTS,
                context:  CWD_PROJECT_NO_ESLINTRC,
                output:   CWD_PROJECT_NO_ESLINTRC_BUILD,
                tsconfig: CWD_PROJECT_NO_ESLINTRC_TSCONFIG_JSON,
                webpack:  { configuration: { } },
            },
            { },
        ];

        let actualRunWithNoEsLintProject: Args;

        compilerCtorMock
            .setup("run")
            .call(It.any(), It.any())
            .callback((...x) => actualRunWithNoEsLintProject = x)
            .returns(Promise.resolve());

        await Tasks.build({ project: CWD_PROJECT_NO_ESLINTRC_SURFACE_JSON, webpackConfiguration: CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_WEBPACK_CONFIGURATION_JS }),

        chai.assert.deepEqual(actualRunWithNoEsLintProject!, expectedRunWithNoEsLintProject, "actualRunWithNoEsLintProject deep equal to expectedRunWithNoEsLintProject");

        const expectedRunWithCompilations: Args =
        [
            {
                ...DEFAULTS,
                compilations:
                [
                    {
                        ...DEFAULTS,
                        compilations: undefined,
                        context:      CWD_PROJECT_WITH_COMPILATIONS,
                        entry:        "file-1.js",
                        output:       CWD_PROJECT_WITH_COMPILATIONS_BUILD,
                        tsconfig:     CWD_PROJECT_WITH_COMPILATIONS_TSCONFIG_JSON,
                        webpack:      { postConfiguration },
                    },
                    {
                        ...DEFAULTS,
                        compilations: undefined,
                        context:      CWD_PROJECT_WITH_COMPILATIONS,
                        entry:        "file-2.js",
                        output:       CWD_PROJECT_WITH_COMPILATIONS_BUILD,
                        tsconfig:     CWD_PROJECT_WITH_COMPILATIONS_TSCONFIG_JSON,
                        webpack:      { postConfiguration },
                    },
                ],
                context:  CWD_PROJECT_WITH_COMPILATIONS,
                output:   CWD_PROJECT_WITH_COMPILATIONS_BUILD,
                tsconfig: CWD_PROJECT_WITH_COMPILATIONS_TSCONFIG_JSON,
                webpack:  { postConfiguration },
            },
            { },
        ];

        let actualRunWithCompilations: Args;

        compilerCtorMock
            .setup("run")
            .call(It.any(), It.any())
            .callback((...x) => actualRunWithCompilations = x)
            .returns(Promise.resolve());

        await Tasks.build({ project: CWD_PROJECT_WITH_COMPILATIONS_SURFACE_JSON, webpackPostConfiguration: CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_WEBPACK_POST_CONFIGURATION_JS }),

        chai.assert.deepEqual(actualRunWithCompilations!, expectedRunWithCompilations, "actualRunWithNoEsLintProject deep equal to expectedRunWithCompilations");

        const expectedRunWithExtraWebpackConfigurationFile: Args =
        [
            {
                ...DEFAULTS,
                compilations:
                [
                    {
                        ...DEFAULTS,
                        compilations: undefined,
                        context:      CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION,
                        output:       CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_BUILD,
                        tsconfig:     CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_TSCONFIG_JSON,
                        webpack:
                        {
                            configuration: { },
                            postConfiguration,
                        },
                    },
                ],
                context:  CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION,
                output:   CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_BUILD,
                tsconfig: CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_TSCONFIG_JSON,
                webpack:
                {
                    configuration: { },
                    postConfiguration,
                },
            },
            { },
        ];

        let actualRunWithExtraWebpackConfigurationFile: Args;

        compilerCtorMock
            .setup("run")
            .call(It.any(), It.any())
            .callback((...x) => actualRunWithExtraWebpackConfigurationFile = x)
            .returns(Promise.resolve());

        await Tasks.build({ project: CWD_PROJECT_WITH_WEBPACK_EXTRA_CONFIGURATION_SURFACE_JSON }),

        chai.assert.deepEqual(actualRunWithExtraWebpackConfigurationFile!, expectedRunWithExtraWebpackConfigurationFile, "actualRunWithExtraWebpackConfigurationFile deep equal to expectedRunWithExtraWebpackConfigurationFile");

        const expectedWatch: Args =
        [
            {
                ...DEFAULTS,
                context:  CWD_PROJECT,
                entry:    "./source/index.ts",
                eslintrc: CWD_PROJECT_ESLINTRC_JSON,
                filename: "index.js",
                output:   path.join(CWD_PROJECT, "./www"),
                tsconfig: path.join(CWD_PROJECT, "./base.tsconfig.json"),
                webpack:  { },
            },
            {
                watch: true,
            },
        ];

        let actualWatch: Args;

        compilerCtorMock
            .setup("watch")
            .call(It.any(), It.any())
            .callback((...x) => actualWatch = x)
            .returns(Promise.resolve({ close: async () => Promise.resolve() }));

        await Tasks.build({ project: CWD_PROJECT_SURFACE_JS, watch: true }),

        chai.assert.deepEqual(actualWatch!, expectedWatch, "actualWatch deep equal to expectedWatch");
    }

    @test
    public async serve(): Promise<void>
    {
        type Args = [Configuration, CliDevServerOptions];

        const expected: Args =
        [
            {
                context:    CWD_PROJECT,
                entry:      "./source/index.ts",
                eslintrc:   CWD_PROJECT_ESLINTRC_JSON,
                filename:   "[name].js",
                forceTs:    [path.join(CWD_PROJECT, "foo"), path.join(CWD_PROJECT, "bar")],
                output:     CWD_PROJECT_BUILD,
                publicPath: "/",
                tsconfig:   CWD_PROJECT_TSCONFIG_JSON,
                webpack:    { configuration: { } },
            },
            { },
        ];

        let actual: Args;

        compilerCtorMock
            .setup("serve")
            .call(It.any(), It.any())
            .callback((...x) => actual = x)
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