/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable import/no-namespace */
import WebpackDevServer from "webpack-dev-server?require=proxy";
import webpack          from "webpack?require=proxy";
import { log }          from "../internal/common.js?require=proxy";
import
{
    createAnalyzerConfiguration,
    createBuildConfiguration,
    createConfiguration,
    createDevServerConfiguration,
} from "../internal/configurations.js?require=proxy";

import type { Server }            from "http";
import Mock, { It }               from "@surface/mock";
import { afterEach, suite, test } from "@surface/test-suite";
import chai                       from "chai";
import Compiler                   from "../internal/compiler.js";

Mock.of<typeof import("../internal/common.js").log>(log)!.call();
Mock.of<typeof import("../internal/configurations.js").createAnalyzerConfiguration>(createAnalyzerConfiguration)!.call(It.any(), It.any());
Mock.of<typeof import("../internal/configurations.js").createBuildConfiguration>(createBuildConfiguration)!.call(It.any(), It.any());
Mock.of<typeof import("../internal/configurations.js").createConfiguration>(createConfiguration)!.call(It.any(), It.any());
Mock.of<typeof import("../internal/configurations.js").createDevServerConfiguration>(createDevServerConfiguration)!.call(It.any(), It.any());

type WebpackCall = (options: import("webpack").Configuration, callback?: (err?: Error, stats?: import("webpack").Stats) => void) => import("webpack").Compiler;

const webpackDevServerConstructor = Mock.of<typeof import("webpack-dev-server")>(WebpackDevServer)!;
const webpackMock                 = Mock.of<WebpackCall>(webpack)!;

function setup(type: "ok" | "ko"): void
{
    const error = type == "ko" ? new Error("Some goes wrong") : undefined;

    const statsMock            = Mock.instance<import("webpack").Stats>();
    const compilerWatchingMock = Mock.instance<ReturnType<import("webpack").Compiler["watch"]>>();

    compilerWatchingMock
        .setup("close")
        .call(It.any())
        .callback(callback => callback());

    const compilerMock = Mock.instance<import("webpack").Compiler>();

    compilerMock
        .setup("run")
        .call(It.any())
        .callback(handler => handler(error!, statsMock.proxy));

    compilerMock
        .setup("watch")
        .call(It.any(), It.any())
        .callback((_, handler) => handler(error!, statsMock.proxy))
        .returns(compilerWatchingMock.proxy);

    webpackMock
        .call(It.any())
        .returns(compilerMock.proxy);

    const WebpackDevServerMock = Mock.instance<import("webpack-dev-server")>();

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
    @afterEach
    public afterEach(): void
    {
        webpackDevServerConstructor.clear();
        webpackMock.clear();
    }

    @test
    public async analyze(): Promise<void>
    {
        setup("ok");

        await Compiler.analyze({ }, { });

        chai.assert.isOk(true);
    }

    @test
    public async run(): Promise<void>
    {
        setup("ok");

        await Compiler.run({ }, { });

        chai.assert.isOk(true);
    }

    @test
    public async serve(): Promise<void>
    {
        setup("ok");

        let signal = await Compiler.serve({ }, { });

        await signal.close();

        signal = await Compiler.serve({ publicPath: "path" }, { });

        await signal.close();

        signal = await Compiler.serve({ publicPath: "/path" }, { });

        await signal.close();

        chai.assert.isOk(true);
    }

    @test
    public async watch(): Promise<void>
    {
        setup("ok");

        const signal = await Compiler.watch({ }, { });

        await signal.close();

        chai.assert.isOk(true);
    }

    @test
    public async runFailure(): Promise<void>
    {
        setup("ko");

        try
        {
            await Compiler.run({ }, { });
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
            await Compiler.serve({ }, { });
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
            await Compiler.run({ }, { });
        }
        catch (error)
        {
            chai.assert.isOk(error);
        }
    }
}