
import Mock, { It }                                               from "@surface/mock";
import { afterEach, assert, beforeEach, suite, test }                     from "@surface/test-suite";
import type { Configuration, Stats, Compiler as WebpackCompiler, Watching as WebpackWatching } from "webpack";
import type WebpackDevServer                                       from "webpack-dev-server";

type WebpackCall = (options: Configuration, callback?: (err?: Error, stats?: Stats) => void) => WebpackCompiler;

const createConfigurationsMock    = Mock.callable<(config: object, options?: object) => Promise<object>>();
const logMock                     = Mock.callable<(...args: unknown[]) => void>();
const webpackDevServerConstructor = Mock.newable();
const webpackMock                 = Mock.callable<WebpackCall>();

Mock.module(import.meta.resolve("../internal/create-configurations.js"), { defaultExport: createConfigurationsMock.proxy });
Mock.module(import.meta.resolve("../internal/common.js"), { namedExports: { log: logMock.proxy } });
Mock.module("webpack", { defaultExport: webpackMock.proxy });
Mock.module("webpack-dev-server", { defaultExport: webpackDevServerConstructor.proxy });

const { default: Builder } = await import("../internal/builder.js");

function setup(type: "ok" | "ko"): void
{
    const error = type == "ko" ? new Error("Something goes wrong") : undefined;

    createConfigurationsMock
        .call(It.any(), It.any())
        .returns(Promise.resolve([{}]));

    const statsMock = Mock.instance<Stats>();

    statsMock.setupGet("toString").returns(() => "");

    const compilerWatchingMock = Mock.instance<WebpackWatching>();

    compilerWatchingMock
        .setup("close")
        .call(It.any())
        .callback((callback: (err: null | Error, result?: void) => void) => callback(error ?? null));

    const compilerMock = Mock.instance<WebpackCompiler>();

    compilerMock
        .setup("run")
        .call(It.any())
        .callback(handler => handler(error!, statsMock.proxy));

    compilerMock
        .setup("watch")
        .call(It.any(), It.any())
        .callback((_, handler) => handler(null, statsMock.proxy))
        .returns(compilerWatchingMock.proxy);

    webpackMock
        .call(It.any())
        .returns(compilerMock.proxy);

    const WebpackDevServerMock = Mock.instance<WebpackDevServer>();

    WebpackDevServerMock
        .setup("start")
        .call()
        .returns(Promise.resolve());

    WebpackDevServerMock
        .setup("stop")
        .call()
        .returns(Promise.resolve());

    webpackDevServerConstructor
        .new(It.any(), It.any())
        .returns(WebpackDevServerMock.proxy);
}

@suite
export default class CompilerSpec
{
    @beforeEach
    public beforeEach(): void
    {
        logMock.lock();
        logMock.call(It.any());

        createConfigurationsMock.lock();
    }

    @afterEach
    public afterEach(): void
    {
        logMock.release();
        createConfigurationsMock.release();
        webpackDevServerConstructor.release();
        webpackMock.release();
    }

    @test
    public async analyze(): Promise<void>
    {
        setup("ok");

        await Builder.analyze({ });

        assert.isOk(true);
    }

    @test
    public async run(): Promise<void>
    {
        setup("ok");

        await Builder.run({ });
        await Builder.run({ logging: true });
        await Builder.run({ logging: "none" });
        await Builder.run({ logging: "normal" });
        await Builder.run({ logging: "verbose" });

        assert.isOk(true);
    }

    @test
    public async serve(): Promise<void>
    {
        setup("ok");

        const signal = await Builder.serve({ });

        await signal.close();

        assert.isOk(true);
    }

    @test
    public async watch(): Promise<void>
    {
        setup("ok");

        const signal = await Builder.watch({ });

        await signal.close();

        assert.isOk(true);
    }

    @test
    public async runFailure(): Promise<void>
    {
        setup("ko");

        try
        {
            await Builder.run({ });
        }
        catch (error)
        {
            assert.isOk(error);
        }
    }

    @test
    public async serveFailure(): Promise<void>
    {
        setup("ko");

        try
        {
            await Builder.serve({ });
        }
        catch (error)
        {
            assert.isOk(error);
        }
    }

    @test
    public async watchFailure(): Promise<void>
    {
        setup("ko");

        try
        {
            const signal = await Builder.watch({ });

            await signal.close();
        }
        catch (error)
        {
            assert.isOk(error);
        }
    }
}
