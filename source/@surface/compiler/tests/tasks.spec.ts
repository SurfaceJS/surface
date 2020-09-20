/* eslint-disable import/no-namespace */
import path                                               from "path";
import Mock, { It }                                       from "@surface/mock";
import { afterEach, beforeEach, suite, test } from "@surface/test-suite";
import { assert }                                         from "chai";
import Compiler, * as compilerNS                          from "../internal/compiler";
import * as externalNS                                    from "../internal/external";
import Tasks                                              from "../internal/tasks";
import AnalyzerOptions                                    from "../internal/types/analyzer-options";
import BuildOptions                                       from "../internal/types/build-options";
import Configuration                                      from "../internal/types/configuration";
import DevServerOptions                                   from "../internal/types/dev-serve-options";

const root = path.parse(process.cwd()).root;

const compilerCtorMock = Mock.intance<typeof Compiler>();
const lookupFileMock   = Mock.callable<typeof externalNS["lookupFile"]>();

lookupFileMock
    .call
    ([
        path.join(root, "project", ""),
        path.join(root, "project", "surface.undefined.js"),
        path.join(root, "project", "surface.undefined.json"),
        path.join(root, "project", "surface.js"),
        path.join(root, "project", "surface.json"),
    ])
    .returns(path.join(root, "project", "surface.json"));

lookupFileMock
    .call
    ([
        path.join(root, "project", ""),
        path.join(root, "project", "surface.production.js"),
        path.join(root, "project", "surface.production.json"),
        path.join(root, "project", "surface.js"),
        path.join(root, "project", "surface.json"),
    ])
    .returns(path.join(root, "project", "surface.production.json"));

lookupFileMock
    .call
    ([
        path.join(root, "project", ".eslintrc.js"),
        path.join(root, "project", ".eslintrc.json"),
        path.join(root, "project", ".eslintrc.yml"),
        path.join(root, "project", ".eslintrc.yaml"),
    ])
    .returns(path.join(root, "project", ".eslintrc.json"));

const removePathAsyncMock = Mock.callable<typeof externalNS["removePathAsync"]>();
const loadModuleMock      = Mock.callable<typeof externalNS["loadModule"]>();

loadModuleMock
    .call(path.join(root, "project", "surface.json"))
    .returns(Promise.resolve({ }));

loadModuleMock
    .call(path.join(root, "project", "surface.production.json"))
    .returns(Promise.resolve({ default: { } }));

loadModuleMock
    .call(path.join(root, "project", "webpack.config.js"))
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

        const expected: Args = [{ }, { }];

        let actual: Args;

        compilerCtorMock
            .setup("run")
            .call(It.any(), It.any())
            .callback((...x) => actual = x)
            .returns(Promise.resolve());

        await Tasks.build({ }),

        assert.deepEqual(actual!, expected);
    }

    @test
    public async clean(): Promise<void>
    {
        const expected = [path.join(root, "project", "build"), path.resolve(__dirname, "../internal", ".cache")];

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

        const expected: Args = [{ eslintrc: path.join(root, "project", ".eslintrc.json"), webpackConfig: { } }, { }];

        let actual: Args;

        compilerCtorMock
            .setup("serve")
            .call(It.any(), It.any())
            .callback((...x) => actual = x)
            .returns(Promise.resolve({ close: async () => Promise.resolve() }));

        await Tasks.serve({ eslintrc: path.join(root, "project", ".eslintrc.json"), webpackConfig: path.join(root, "project", "webpack.config.js") }),

        assert.deepEqual(actual!, expected);
    }
}