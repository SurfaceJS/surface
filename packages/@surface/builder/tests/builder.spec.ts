
import type { Server }                                            from "http";
import Mock, { It }                                               from "@surface/mock";
import { afterEach, beforeEach, suite, test }                     from "@surface/test-suite";
import chai                                                       from "chai";
import type { Configuration, Stats, Compiler as WebpackCompiler } from "webpack";
import webpack                                                    from "webpack";
import WebpackDevServer                                           from "webpack-dev-server";
import Builder                                                    from "../internal/builder.js";
import { log }                                                    from "../internal/common.js";
import createConfigurations                                       from "../internal/create-configurations.js";

type WebpackCall = (options: Configuration, callback?: (err?: Error, stats?: Stats) => void) => WebpackCompiler;

const createConfigurationsMock    = Mock.of(createConfigurations);
const logMock                     = Mock.of(log);
const webpackDevServerConstructor = Mock.of(WebpackDevServer);
const webpackMock                 = Mock.of<WebpackCall>(webpack);

function setup(type: "ok" | "ko"): void
{
    const error = type == "ko" ? new Error("Something goes wrong") : undefined;

    const statsMock = Mock.instance<Stats>();

    statsMock.setupGet("toString").returns(() => "");

    const compilerWatchingMock = Mock.instance<ReturnType<WebpackCompiler["watch"]>>();

    compilerWatchingMock
        .setup("close")
        .call(It.any())
        .callback(callback => callback(error));

    const compilerMock = Mock.instance<WebpackCompiler>();

    compilerMock
        .setup("run")
        .call(It.any())
        .callback(handler => handler(error!, statsMock.proxy));

    compilerMock
        .setup("watch")
        .call(It.any(), It.any())
        .callback((_, handler) => handler(undefined, statsMock.proxy))
        .returns(compilerWatchingMock.proxy);

    webpackMock
        .call(It.any())
        .returns(compilerMock.proxy);

    const WebpackDevServerMock = Mock.instance<WebpackDevServer>();

    WebpackDevServerMock.setup("close");

    WebpackDevServerMock
        .setup("listen")
        .call<(port: number, hostname: string, callback?: (error?: Error | undefined) => void) => Server>(It.any(), It.any(), It.any())
        .callback((_1, _2, callback) => callback!(error));

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
        logMock.call();

        createConfigurationsMock.lock();
        createConfigurationsMock.call(It.any(), It.any());
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

        chai.assert.isOk(true);
    }

    @test
    public async run(): Promise<void>
    {
        setup("ok");

        await Builder.run({ });
        await Builder.run({ logging: true });
        await Builder.run({ logging: "none" });
        await Builder.run({ logging: "log" });
        await Builder.run({ logging: "verbose" });

        chai.assert.isOk(true);
    }

    @test
    public async serve(): Promise<void>
    {
        setup("ok");

        const signal = await Builder.serve({ });

        await signal.close();

        chai.assert.isOk(true);
    }

    @test
    public async watch(): Promise<void>
    {
        setup("ok");

        const signal = await Builder.watch({ });

        await signal.close();

        chai.assert.isOk(true);
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
            chai.assert.isOk(error);
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
            chai.assert.isOk(error);
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
            chai.assert.isOk(error);
        }
    }
}