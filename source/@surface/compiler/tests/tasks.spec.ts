/* eslint-disable import/no-namespace */
import path                                   from "path";
import Mock, { It }                           from "@surface/mock";
import { afterEach, beforeEach, suite, test } from "@surface/test-suite";
import { assert }                             from "chai";
import Compiler, * as compilerNS              from "../internal/compiler";
import * as externalNS                        from "../internal/external";
import Tasks                                  from "../internal/tasks";
import AnalyzerOptions                        from "../internal/types/analyzer-options";
import BuildOptions                           from "../internal/types/build-options";
import Configuration                          from "../internal/types/configuration";
import DevServerOptions                       from "../internal/types/dev-serve-options";
import Options                                from "../internal/types/options";

const CWD = process.cwd();

const compilerCtorMock = Mock.intance<typeof Compiler>();
const isFileMock       = Mock.callable<typeof externalNS["isFile"]>();
const lookupFileMock   = Mock.callable<typeof externalNS["lookupFile"]>();

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

const DEFAULTS: Required<Pick<Configuration, "context" | "entry" | "filename" | "output" | "tsconfig">> =
{
    context:  CWD,
    entry:    "./source/index.ts",
    filename: "[name].js",
    output:   CWD_BUILD,
    tsconfig: CWD_TSCONFIG_JSON,
};

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

const removePathAsyncMock = Mock.callable<typeof externalNS["removePathAsync"]>();
const loadModuleMock      = Mock.callable<typeof externalNS["loadModule"]>();

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

@suite
export default class TasksSpec
{
    @beforeEach
    public beforeEach(): void
    {
        const compilerNSMock: Partial<typeof compilerNS> =
        {
            default: compilerCtorMock.proxy,
        };

        const externalNSMock: Partial<typeof externalNS> =
        {
            isFile:          isFileMock.proxy,
            loadModule:      loadModuleMock.proxy,
            lookupFile:      lookupFileMock.proxy,
            removePathAsync: removePathAsyncMock.proxy,
        };

        Mock.module(compilerNS, compilerNSMock);
        Mock.module(externalNS, externalNSMock);
    }

    @afterEach
    public afterEach(): void
    {
        Mock.restore(compilerNS);
        Mock.restore(externalNS);
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

        assert.deepEqual(actual!, expected);
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

        assert.deepEqual(actualRun!, expectedRun, "actualRun deep equal to expectedRun");

        const expectedRunWithProject: Args =
        [
            {
                ...DEFAULTS,
                context:  CWD_PROJECT,
                eslintrc: CWD_PROJECT_ESLINTRC_JSON,
                forceTs:  true,
                output:   CWD_PROJECT_BUILD,
                tsconfig: CWD_PROJECT_TSCONFIG_JSON,
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

        assert.deepEqual(actualRunWithProject!, expectedRunWithProject, "actualRunWithProject deep equal to expectedRunWithProject");

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

        assert.deepEqual(actualRunWithNoEsLintProject!, expectedRunWithNoEsLintProject, "actualRunWithNoEsLintProject deep equal to expectedRunWithNoEsLintProject");

        const expectedWatch: Args =
        [
            {
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

        assert.deepEqual(actualWatch!, expectedWatch, "actualWatch deep equal to expectedWatch");
    }

    @test
    public async clean(): Promise<void>
    {
        const expected = path.resolve(__dirname, "../internal", ".cache");

        let actual: string;

        removePathAsyncMock
            .call(expected)
            .callback(x => actual = x)
            .returns(Promise.resolve(true));

        await Tasks.clean(),

        assert.deepEqual(actual!, expected);
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

        assert.deepEqual(actual!, expected);
    }
}