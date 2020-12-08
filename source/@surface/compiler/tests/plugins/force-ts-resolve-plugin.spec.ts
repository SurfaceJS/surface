// /* eslint-disable array-element-newline */
// /* eslint-disable import/no-namespace */

// import Mock                                               from "@surface/mock";
// import { afterEach, beforeEach, shouldPass, suite, test } from "@surface/test-suite";
// import { assert }                                         from "chai";
// import ForceTsResolvePlugin                               from "../../internal/plugins/force-ts-resolve-plugin.js";

// @suite
// export default class ForceTsResolvePluginSpec
// {
//     @beforeEach
//     public beforeEach(): void
//     {
//         const fsMock = Mock.instance<typeof externalNS["fs"]>();

//         fsMock.setup("existsSync").call("path-1/foo.ts").returns(true);
//         fsMock.setup("existsSync").call("path-2/foo.ts").returns(true);
//         fsMock.setup("existsSync").call("path-1/bar.ts").returns(false);
//         fsMock.setup("existsSync").call("path-2/bar.ts").returns(false);

//         Mock.module(externalNS, { fs: fsMock.proxy });
//     }

//     @afterEach
//     public afterEach(): void
//     {
//         Mock.restore(externalNS);
//     }

//     @test @shouldPass
//     public apply(): void
//     {
//         const resolver =
//         {
//             hooks:
//             {
//                 resolved:
//                 {
//                     tap(_: string, callback: (request: { path: string }) => void): void
//                     {
//                         callback({ path: "path-1/foo" });
//                         callback({ path: "path-1/foo.js" });
//                         callback({ path: "path-1/bar.js" });
//                         callback({ path: "path-1/baz.ts" });
//                         callback({ path: "path-2/foo" });
//                     },
//                 },
//             },
//         };

//         assert.doesNotThrow(() => new ForceTsResolvePlugin().apply(resolver));
//         assert.doesNotThrow(() => new ForceTsResolvePlugin(["path-2"]).apply(resolver));
//     }
// }