/* eslint-disable array-element-newline */
import Mock, { It }                           from "@surface/mock";
import { afterEach, beforeEach, suite, test } from "@surface/test-suite";
import chai                                   from "chai";
import Tasks                                  from "../internal/tasks.js";
import type CliAnalyzerOptions                from "../internal/types/cli-analyzer-options";
import type CliBuildOptions                   from "../internal/types/cli-build-options";
import type CliDevServerOptions               from "../internal/types/cli-dev-serve-options";
import type CliOptions                        from "../internal/types/cli-options";

const tasksMock = Mock.of(Tasks);

@suite
export default class BinSpec
{
    @beforeEach
    public beforeEach(): void
    {
        tasksMock.lock();
    }

    @afterEach
    public afterEach(): void
    {
        tasksMock.release();
    }

    @test
    public async analyze(): Promise<void>
    {
        let actual: Required<CliOptions & CliAnalyzerOptions>;

        tasksMock
            .setup("analyze")
            .call(It.any())
            .callback(x => actual = x as Required<CliOptions & CliAnalyzerOptions>);

        process.argv =
        [
            "",
            "",
            "--analyzer-host=analyzerHost",
            "--analyzer-mode=server",
            "--analyzer-port=auto",
            "--context=context",
            "--default-sizes=parsed",
            "--entry=entry",
            "--eslintrc=eslintrc",
            "--exclude-assets=excludeAssets",
            "--filename=filename",
            "--html-template=htmlTemplate",
            "--include-files=**/foo/*.js,**/bar/*.js",
            "--logging=info",
            "--mode=development",
            "--open-analyzer=true",
            "--output=output",
            "--prefer-ts=true",
            "--project=project",
            "--public-path=publicPath",
            "--report-filename=reportFilename",
            "--report-title=reportTitle",
            "--tsconfig=tsconfig",
            "--use-workbox=true",
            "--webpack-configuration=webpackConfiguration",
            "--webpack-post-configuration=webpackPostConfiguration",
        ];

        await import("../bin/analyze.js");

        const expected: Required<CliOptions & CliAnalyzerOptions> =
        {
            analyzerHost:             "analyzerHost",
            analyzerMode:             "server",
            analyzerPort:             "auto",
            context:                  "context",
            defaultSizes:             "parsed",
            entry:                    ["entry"],
            eslintrc:                 "eslintrc",
            excludeAssets:            ["excludeAssets"],
            filename:                 "filename",
            htmlTemplate:             "htmlTemplate",
            includeFiles:             ["**/foo/*.js", "**/bar/*.js"],
            logging:                  "info",
            mode:                     "development",
            openAnalyzer:             true,
            output:                   "output",
            preferTs:                  true,
            project:                  "project",
            publicPath:               "publicPath",
            reportFilename:           "reportFilename",
            reportTitle:              "reportTitle",
            tsconfig:                 "tsconfig",
            useWorkbox:               true,
            webpackConfiguration:     "webpackConfiguration",
            webpackPostConfiguration: "webpackPostConfiguration",
        };

        chai.assert.deepEqual(actual!, expected);
    }

    @test
    public async build(): Promise<void>
    {
        let actual: Required<CliOptions & CliBuildOptions>;

        tasksMock
            .setup("build")
            .call(It.any())
            .callback(x => actual = x as Required<CliOptions & CliBuildOptions>);

        process.argv =
        [
            "",
            "",
            "--context=context",
            "--entry=entry",
            "--eslintrc=eslintrc",
            "--filename=filename",
            "--html-template=htmlTemplate",
            "--include-files=**/foo/*.js,**/bar/*.js",
            "--logging=info",
            "--mode=development",
            "--output=output",
            "--prefer-ts=true",
            "--project=project",
            "--public-path=publicPath",
            "--tsconfig=tsconfig",
            "--use-workbox=true",
            "--watch=true",
            "--webpack-configuration=webpackConfiguration",
            "--webpack-post-configuration=webpackPostConfiguration",
        ];

        await import("../bin/build.js");

        const expected: Required<CliOptions & CliBuildOptions> =
        {
            context:                  "context",
            entry:                    ["entry"],
            eslintrc:                 "eslintrc",
            filename:                 "filename",
            htmlTemplate:             "htmlTemplate",
            includeFiles:             ["**/foo/*.js", "**/bar/*.js"],
            logging:                  "info",
            mode:                     "development",
            output:                   "output",
            preferTs:                  true,
            project:                  "project",
            publicPath:               "publicPath",
            tsconfig:                 "tsconfig",
            useWorkbox:               true,
            watch:                    true,
            webpackConfiguration:     "webpackConfiguration",
            webpackPostConfiguration: "webpackPostConfiguration",
        };

        chai.assert.deepEqual(actual!, expected);
    }

    @test
    public async serve(): Promise<void>
    {
        let actual: Required<CliOptions & CliDevServerOptions>;

        tasksMock
            .setup("serve")
            .call(It.any())
            .callback(x => actual = x as Required<CliOptions & CliDevServerOptions>);

        process.argv =
        [
            "",
            "",
            "--compress",
            "--content-base-public-path=contentBasePublicPath",
            "--content-base=contentBase",
            "--context=context",
            "--entry=entry",
            "--eslintrc=eslintrc",
            "--filename=filename",
            "--host=localhost",
            "--hot",
            "--hot-only",
            "--html-template=htmlTemplate",
            "--include-files=**/foo/*.js,**/bar/*.js",
            "--index=index",
            "--lazy",
            "--live-reload",
            "--logging=info",
            "--open",
            "--open-page=/",
            "--output=output",
            "--port=8080",
            "--prefer-ts",
            "--project=project",
            "--public-path=publicPath",
            "--public=public",
            "--quiet",
            "--tsconfig=tsconfig",
            "--use-local-ip",
            "--use-workbox",
            "--watch-content-base",
            "--webpack-configuration=webpackConfiguration",
            "--webpack-post-configuration=webpackPostConfiguration",
            "--write-to-disk",
        ];

        await import("../bin/serve.js");

        const expected: Required<Omit<CliOptions, "mode"> & CliDevServerOptions> =
        {
            compress:                 true,
            contentBase:              ["contentBase"],
            contentBasePublicPath:    ["contentBasePublicPath"],
            context:                  "context",
            entry:                    ["entry"],
            eslintrc:                 "eslintrc",
            filename:                 "filename",
            host:                     "localhost",
            hot:                      true,
            hotOnly:                  true,
            htmlTemplate:             "htmlTemplate",
            includeFiles:             ["**/foo/*.js", "**/bar/*.js"],
            index:                    "index",
            lazy:                     true,
            liveReload:               true,
            logging:                  "info",
            open:                     true,
            openPage:                 ["/"],
            output:                   "output",
            port:                     8080,
            preferTs:                 true,
            project:                  "project",
            public:                   "public",
            publicPath:               "publicPath",
            quiet:                    true,
            tsconfig:                 "tsconfig",
            useLocalIp:               true,
            useWorkbox:               true,
            watchContentBase:         true,
            webpackConfiguration:     "webpackConfiguration",
            webpackPostConfiguration: "webpackPostConfiguration",
            writeToDisk:              true,
        };

        chai.assert.deepEqual(actual!, expected);
    }
}