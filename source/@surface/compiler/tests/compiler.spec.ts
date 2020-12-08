// /* eslint-disable import/no-namespace */
// import type { Server }                        from "http";
// import Mock, { It }                           from "@surface/mock";
// import { afterEach, beforeEach, suite, test } from "@surface/test-suite";
// import chai                                   from "chai";
// import type webpack                           from "webpack";
// import type WebpackDevServer                  from "webpack-dev-server";
// import * as commonNS                          from "../internal/common.js";
// import Compiler                               from "../internal/compiler.js";
// import * as configurationsNS                  from "../internal/configurations.js";

// type Common         = typeof commonNS;
// type Configurations = typeof configurationsNS;
// type External       = typeof external;

// const logMock = Mock.callable<Common["log"]>();
// logMock.call(It.any());

// const webpackDevServerConstructor = Mock.newable<typeof WebpackDevServer>();
// const webpackMock                 = Mock.callable<(options?: webpack.Configuration) => webpack.Compiler>();

// function setup(type: "ok" | "ko"): void
// {
//     const error = type == "ko" ? new Error("Some goes wrong") : undefined;

//     const statsMock            = Mock.instance<webpack.Stats>();
//     const compilerWatchingMock = Mock.instance<ReturnType<webpack.Compiler["watch"]>>();

//     compilerWatchingMock
//         .setup("close")
//         .call(It.any())
//         .callback(callback => callback());

//     const compilerMock = Mock.instance<webpack.Compiler>();

//     compilerMock
//         .setup("run")
//         .call(It.any())
//         .callback(handler => handler(error!, statsMock.proxy));

//     compilerMock
//         .setup("watch")
//         .call(It.any(), It.any())
//         .callback((_, handler) => handler(error!, statsMock.proxy))
//         .returns(compilerWatchingMock.proxy);

//     webpackMock
//         .call(It.any())
//         .returns(compilerMock.proxy);

//     const WebpackDevServerMock = Mock.instance<WebpackDevServer>();

//     WebpackDevServerMock.setup("close");

//     WebpackDevServerMock
//         .setup("listen")
//         .call<(port: number, hostname: string, callback?: (error?: Error | undefined) => void) => Server>(It.any(), It.any(), It.any())
//         .callback((_1, _2, callback) => callback!(error));

//     webpackDevServerConstructor
//         .new(It.any(), It.any())
//         .returns(WebpackDevServerMock.proxy);
// }

// @suite
// export default class CompilerSpec
// {
//     @beforeEach
//     public beforeEach(): void
//     {
//         // const commonNSMock: Partial<Common> =
//         // {
//         //     log: logMock.proxy,
//         // };

//         // const configurationsNSMock: Partial<Configurations> =
//         // {
//         //     createAnalyzerConfiguration:  () => ({ }),
//         //     createBuildConfiguration:     () => ({ }),
//         //     createDevServerConfiguration: () => ({ }),
//         // };

//         const externalNSMock: Partial<External> =
//         {
//             WebpackDevServer: webpackDevServerConstructor.proxy,
//             webpack:          webpackMock.proxy as typeof webpack,
//         };

//         // Mock.module(commonNS,         commonNSMock);
//         // Mock.module(configurationsNS, configurationsNSMock);
//         Mock.module(external, externalNSMock);
//     }

//     @afterEach
//     public afterEach(): void
//     {
//         Mock.restore(commonNS);
//         Mock.restore(configurationsNS);
//         Mock.restore(externalNS);
//     }

//     @test
//     public async analyze(): Promise<void>
//     {
//         setup("ok");

//         await Compiler.analyze({ }, { });

//         chai.assert.isOk(true);
//     }

//     @test
//     public async run(): Promise<void>
//     {
//         setup("ok");

//         await Compiler.run({ }, { });

//         chai.assert.isOk(true);
//     }

//     @test
//     public async serve(): Promise<void>
//     {
//         setup("ok");

//         let signal = await Compiler.serve({ }, { });

//         await signal.close();

//         signal = await Compiler.serve({ publicPath: "path" }, { });

//         await signal.close();

//         signal = await Compiler.serve({ publicPath: "/path" }, { });

//         await signal.close();

//         chai.assert.isOk(true);
//     }

//     @test
//     public async watch(): Promise<void>
//     {
//         setup("ok");

//         const signal = await Compiler.watch({ }, { });

//         await signal.close();

//         chai.assert.isOk(true);
//     }

//     @test
//     public async runFailure(): Promise<void>
//     {
//         setup("ko");

//         try
//         {
//             await Compiler.run({ }, { });
//         }
//         catch (error)
//         {
//             chai.assert.isOk(error);
//         }
//     }

//     @test
//     public async serveFailure(): Promise<void>
//     {
//         setup("ko");

//         try
//         {
//             await Compiler.serve({ }, { });
//         }
//         catch (error)
//         {
//             chai.assert.isOk(error);
//         }
//     }

//     @test
//     public async watchFailure(): Promise<void>
//     {
//         setup("ko");

//         try
//         {
//             await Compiler.run({ }, { });
//         }
//         catch (error)
//         {
//             chai.assert.isOk(error);
//         }
//     }
// }