import path                                    from "path";
import { isFile, lookupFile, removePathAsync } from "@surface/io";
import Mock, { It }                            from "@surface/mock";
import { afterEach, beforeEach, suite, test }  from "@surface/test-suite";
import chai                                    from "chai";
import { loadModule }                          from "../internal/common.js";
import Compiler                                from "../internal/compiler.js";
import Tasks                                   from "../internal/tasks.js";
import type AnalyzerOptions                    from "../internal/types/analyzer-options";
import type BuildOptions                       from "../internal/types/build-options";
import type Configuration                      from "../internal/types/configuration";
import type DevServerOptions                   from "../internal/types/dev-serve-options";
import type Options                            from "../internal/types/options";

const CWD = process.cwd();

const isFileMock          = Mock.of(isFile)!;
const lookupFileMock      = Mock.of(lookupFile)!;
const removePathAsyncMock = Mock.of(removePathAsync)!;
const compilerCtorMock    = Mock.of(Compiler)!;
const loadModuleMock      = Mock.of(loadModule)!;

const CWD_BUILD                             = path.join(CWD, "build");
const CWD_PROJECT                           = path.join(CWD, "project");
const CWD_PROJECT_BUILD                     = path.join(CWD, "project", "build");
const CWD_PROJECT_ESLINTRC_JS               = path.join(CWD, "project", ".eslintrc.js");
const CWD_PROJECT_ESLINTRC_JSON             = path.join(CWD, "project", ".eslintrc.json");
const CWD_PROJECT_ESLINTRC_YAML             = path.join(CWD, "project", ".eslintrc.yaml");
const CWD_PROJECT_ESLINTRC_YML              = path.join(CWD, "project", ".eslintrc.yml");
const CWD_PROJECT_NO_ESLINTRC               = path.join(CWD, "project-no-eslintrc");
const CWD_PROJECT_NO_ESLINTRC_BUILD         = path.join(CWD, "project-no-eslintrc", "build");
const CWD_PROJECT_NO_ESLINTRC_SURFACE_JSON  = path.join(CWD, "project-no-eslintrc", "surface.json");
const CWD_PROJECT_NO_ESLINTRC_TSCONFIG_JSON = path.join(CWD, "project-no-eslintrc", "tsconfig.json");
const CWD_PROJECT_SURFACE_DEVELOPMENT_JS    = path.join(CWD, "project", "surface.development.js");
const CWD_PROJECT_SURFACE_DEVELOPMENT_JSON  = path.join(CWD, "project", "surface.development.json");
const CWD_PROJECT_SURFACE_JS                = path.join(CWD, "project", "surface.js");
const CWD_PROJECT_SURFACE_JSON              = path.join(CWD, "project", "surface.json");
const CWD_PROJECT_TSCONFIG_JSON             = path.join(CWD, "project", "tsconfig.json");
const CWD_PROJECT_WEBPACK_CONFIG_JS         = path.join(CWD, "project", "webpack.config.js");
const CWD_TSCONFIG_JSON                     = path.join(CWD, "tsconfig.json");

const DEFAULTS: Required<Pick<Configuration, "context" | "entry" | "filename" | "publicPath" | "output" | "tsconfig">> =
{
    context:    CWD,
    entry:      "./source/index.ts",
    filename:   "[name].js",
    output:     CWD_BUILD,
    publicPath: "/",
    tsconfig:   CWD_TSCONFIG_JSON,
};

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
            .returns(Promise.resolve({ default: { } }));

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
        type Args = [Configuration, AnalyzerOptions];

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
        type Args = [Configuration, BuildOptions];

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
            },
            { },
        ];

        let actualRunWithNoEsLintProject: Args;

        compilerCtorMock
            .setup("run")
            .call(It.any(), It.any())
            .callback((...x) => actualRunWithNoEsLintProject = x)
            .returns(Promise.resolve());

        await Tasks.build({ project: CWD_PROJECT_NO_ESLINTRC_SURFACE_JSON }),

        chai.assert.deepEqual(actualRunWithNoEsLintProject!, expectedRunWithNoEsLintProject, "actualRunWithNoEsLintProject deep equal to expectedRunWithNoEsLintProject");

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
        type Args = [Configuration, DevServerOptions];

        const expected: Args =
        [
            {
                context:       CWD_PROJECT,
                entry:         "./source/index.ts",
                eslintrc:      CWD_PROJECT_ESLINTRC_JSON,
                filename:      "[name].js",
                forceTs:       [path.join(CWD_PROJECT, "foo"), path.join(CWD_PROJECT, "bar")],
                output:        CWD_PROJECT_BUILD,
                publicPath:    "/",
                tsconfig:      CWD_PROJECT_TSCONFIG_JSON,
                webpackConfig: { },
            },
            { },
        ];

        let actual: Args;

        compilerCtorMock
            .setup("serve")
            .call(It.any(), It.any())
            .callback((...x) => actual = x)
            .returns(Promise.resolve({ close: async () => Promise.resolve() }));

        const configuration: Options & DevServerOptions =
        {
            eslintrc:      CWD_PROJECT_ESLINTRC_JSON,
            project:       "project",
            webpackConfig: CWD_PROJECT_WEBPACK_CONFIG_JS,
        };

        await Tasks.serve(configuration),

        chai.assert.deepEqual(actual!, expected);
    }
}