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

const root = path.parse(process.cwd()).root;

const compilerCtorMock = Mock.intance<typeof Compiler>();
const isFileMock       = Mock.callable<typeof externalNS["isFile"]>();
const lookupFileMock   = Mock.callable<typeof externalNS["lookupFile"]>();

const ROOT_PROJECT                           = path.join(root, "project");
const ROOT_PROJECT_BUILD                     = path.join(root, "project", "build");
const ROOT_PROJECT_ESLINTRC_JS               = path.join(root, "project", ".eslintrc.js");
const ROOT_PROJECT_ESLINTRC_JSON             = path.join(root, "project", ".eslintrc.json");
const ROOT_PROJECT_ESLINTRC_YAML             = path.join(root, "project", ".eslintrc.yaml");
const ROOT_PROJECT_ESLINTRC_YML              = path.join(root, "project", ".eslintrc.yml");
const ROOT_PROJECT_NO_ESLINTRC               = path.join(root, "project-no-eslintrc");
const ROOT_PROJECT_NO_ESLINTRC_BUILD         = path.join(root, "project-no-eslintrc", "build");
const ROOT_PROJECT_NO_ESLINTRC_SURFACE_JSON  = path.join(root, "project-no-eslintrc", "surface.json");
const ROOT_PROJECT_NO_ESLINTRC_TSCONFIG_JSON = path.join(root, "project-no-eslintrc", "tsconfig.json");
const ROOT_PROJECT_SURFACE_DEVELOPMENT_JS    = path.join(root, "project", "surface.development.js");
const ROOT_PROJECT_SURFACE_DEVELOPMENT_JSON  = path.join(root, "project", "surface.development.json");
const ROOT_PROJECT_SURFACE_JS                = path.join(root, "project", "surface.js");
const ROOT_PROJECT_SURFACE_JSON              = path.join(root, "project", "surface.json");
const ROOT_PROJECT_TSCONFIG_JSON             = path.join(root, "project", "tsconfig.json");
const ROOT_PROJECT_WEBPACK_CONFIG_JS         = path.join(root, "project", "webpack.config.js");

const DEFAULTS: Required<Pick<Configuration, "context" | "entry" | "filename" | "output" | "tsconfig">> =
{
    context:  ".",
    entry:    "./source/index.ts",
    filename: "[name].js",
    output:   "./build",
    tsconfig: "./tsconfig.json",
};

isFileMock.call(ROOT_PROJECT_NO_ESLINTRC_SURFACE_JSON).returns(true);
isFileMock.call(ROOT_PROJECT_SURFACE_DEVELOPMENT_JS).returns(true);
isFileMock.call(ROOT_PROJECT_SURFACE_DEVELOPMENT_JSON).returns(true);
isFileMock.call(ROOT_PROJECT_SURFACE_JS).returns(true);
isFileMock.call(ROOT_PROJECT_SURFACE_JSON).returns(true);

lookupFileMock
    .call
    ([
        ROOT_PROJECT_SURFACE_DEVELOPMENT_JS,
        ROOT_PROJECT_SURFACE_DEVELOPMENT_JSON,
        ROOT_PROJECT_SURFACE_JS,
        ROOT_PROJECT_SURFACE_JSON,
    ])
    .returns(ROOT_PROJECT_SURFACE_JSON);

lookupFileMock
    .call
    ([
        ROOT_PROJECT_ESLINTRC_JS,
        ROOT_PROJECT_ESLINTRC_JSON,
        ROOT_PROJECT_ESLINTRC_YML,
        ROOT_PROJECT_ESLINTRC_YAML,
    ])
    .returns(ROOT_PROJECT_ESLINTRC_JSON);

const removePathAsyncMock = Mock.callable<typeof externalNS["removePathAsync"]>();
const loadModuleMock      = Mock.callable<typeof externalNS["loadModule"]>();

loadModuleMock
    .call(ROOT_PROJECT_SURFACE_JS)
    .returns
    (
        Promise.resolve
        ({
            context:  ROOT_PROJECT,
            entry:    "./source/index.ts",
            filename: "index.js",
            output:   path.join(ROOT_PROJECT, "./www"),
            tsconfig: path.join(ROOT_PROJECT, "./base.tsconfig.json"),
        }),
    );

loadModuleMock
    .call(ROOT_PROJECT_SURFACE_JSON)
    .returns(Promise.resolve({ forceTs: ["foo", "bar"] }));

loadModuleMock
    .call(ROOT_PROJECT_SURFACE_DEVELOPMENT_JSON)
    .returns(Promise.resolve({ eslintrc: ROOT_PROJECT_ESLINTRC_JSON, forceTs: true }));

loadModuleMock
    .call(ROOT_PROJECT_NO_ESLINTRC_SURFACE_JSON)
    .returns(Promise.resolve({ }));

loadModuleMock
    .call(ROOT_PROJECT_WEBPACK_CONFIG_JS)
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

        const expected: Args = [{ }, { }];

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

        const expectedRun: Args = [{ }, { mode: "development" }];

        let actualRun: Args;

        compilerCtorMock
            .setup("run")
            .call(It.any(), It.any())
            .callback((...x) => actualRun = x)
            .returns(Promise.resolve());

        await Tasks.build({ mode: "development" }),

        assert.deepEqual(actualRun!, expectedRun);

        const expectedRunWithProject: Args =
        [
            {
                ...DEFAULTS,
                context:  ROOT_PROJECT,
                eslintrc: ROOT_PROJECT_ESLINTRC_JSON,
                forceTs:  true,
                output:   ROOT_PROJECT_BUILD,
                tsconfig: ROOT_PROJECT_TSCONFIG_JSON,
            },
            { },
        ];

        let actualRunWithProject: Args;

        compilerCtorMock
            .setup("run")
            .call(It.any(), It.any())
            .callback((...x) => actualRunWithProject = x)
            .returns(Promise.resolve());

        await Tasks.build({ project: ROOT_PROJECT_SURFACE_DEVELOPMENT_JSON }),

        assert.deepEqual(actualRunWithProject!, expectedRunWithProject);

        const expectedRunWithNoEsLintProject: Args =
        [
            {
                ...DEFAULTS,
                context:  ROOT_PROJECT_NO_ESLINTRC,
                output:   ROOT_PROJECT_NO_ESLINTRC_BUILD,
                tsconfig: ROOT_PROJECT_NO_ESLINTRC_TSCONFIG_JSON,
            },
            { },
        ];

        let actualRunWithNoEsLintProject: Args;

        compilerCtorMock
            .setup("run")
            .call(It.any(), It.any())
            .callback((...x) => actualRunWithNoEsLintProject = x)
            .returns(Promise.resolve());

        await Tasks.build({ project: ROOT_PROJECT_NO_ESLINTRC_SURFACE_JSON }),

        assert.deepEqual(actualRunWithNoEsLintProject!, expectedRunWithNoEsLintProject);

        const expectedWatch: Args =
        [
            {
                context:  ROOT_PROJECT,
                entry:    "./source/index.ts",
                filename: "index.js",
                output:   path.join(ROOT_PROJECT, "./www"),
                tsconfig: path.join(ROOT_PROJECT, "./base.tsconfig.json"),
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

        await Tasks.build({ project: ROOT_PROJECT_SURFACE_JS, watch: true }),

        assert.deepEqual(actualWatch!, expectedWatch);
    }

    @test
    public async clean(): Promise<void>
    {
        const expected = [ROOT_PROJECT_BUILD, path.resolve(__dirname, "../internal", ".cache")];

        const actual: string[] =
        [];

        removePathAsyncMock
            .call(expected[0])
            .callback(x => actual.push(x))
            .returns(Promise.resolve(true));

        removePathAsyncMock
            .call(expected[1])
            .callback(x => actual.push(x))
            .returns(Promise.resolve(true));

        await Tasks.clean({ project: path.join(root, "project") }),

        assert.deepEqual(actual!, expected);
    }

    @test
    public async serve(): Promise<void>
    {
        type Args = [Configuration, DevServerOptions];

        const expected: Args =
        [
            {
                context:       ROOT_PROJECT,
                entry:         "./source/index.ts",
                eslintrc:      ROOT_PROJECT_ESLINTRC_JSON,
                filename:      "[name].js",
                forceTs:       [path.join(ROOT_PROJECT, "foo"), path.join(ROOT_PROJECT, "bar")],
                output:        ROOT_PROJECT_BUILD,
                tsconfig:      ROOT_PROJECT_TSCONFIG_JSON,
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
            eslintrc:      ROOT_PROJECT_ESLINTRC_JSON,
            project:       ROOT_PROJECT_SURFACE_JSON,
            webpackConfig: ROOT_PROJECT_WEBPACK_CONFIG_JS,
        };

        await Tasks.serve(configuration),

        assert.deepEqual(actual!, expected);
    }
}