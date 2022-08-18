/* eslint-disable array-element-newline */
import Mock, { It }                           from "@surface/mock";
import { afterEach, beforeEach, suite, test } from "@surface/test-suite";
import chai                                   from "chai";
import Commands                               from "../internal/commands.js";
import type CliAnalyzerOptions                from "../internal/types/cli-analyzer-options";
import type CliBuildOptions                   from "../internal/types/cli-build-options";
import type CliDevServerOptions               from "../internal/types/cli-dev-serve-options";
import type CliOptions                        from "../internal/types/cli-options";

const commandsMock = Mock.of(Commands);

@suite
export default class BinSpec
{
    @beforeEach
    public beforeEach(): void
    {
        commandsMock.lock();
    }

    @afterEach
    public afterEach(): void
    {
        commandsMock.release();
    }

    @test
    public async analyze(): Promise<void>
    {
        let actual: Required<CliOptions & CliAnalyzerOptions>;

        commandsMock
            .setup("analyze")
            .call(It.any())
            .callback(x => actual = x as Required<CliOptions & CliAnalyzerOptions>);

        process.argv =
        [
            "",
            "",
            "--analyzer-default-sizes=parsed",
            "--analyzer-exclude-assets=analyzerExcludeAssets-1,analyzerExcludeAssets-2",
            "--analyzer-host=analyzerHost",
            "--analyzer-log-level=info",
            "--analyzer-mode=static",
            "--analyzer-open=true",
            "--analyzer-port=auto",
            "--analyzer-report-filename=analyzerReportFilename",
            "--analyzer-report-title=analyzerReportTitle",
            "--clean=true",
            "--config=config",
            "--context=context",
            "--entry=entry-1,entry-2",
            "--eslint-config-file=eslintConfigFile",
            "--eslint-enabled=true",
            "--eslint-files=eslintFiles",
            "--eslint-formatter=codeframe",
            "--filename=filename",
            "--htmlx=aot",
            "--include-files=includeFiles-1,includeFiles-2",
            "--index=index",
            "--logging=normal",
            "--main=main",
            "--mode=development",
            "--output=output",
            "--prefer-ts=preferTs-1,preferTs-2",
            "--project=project",
            "--public-path=publicPath",
            "--target=pwa",
            "--tsconfig=tsconfig",
        ];

        await import("../bin/analyze.js");

        const expected: Required<CliOptions & CliAnalyzerOptions> =
        {
            analyzerDefaultSizes:   "parsed",
            analyzerExcludeAssets:  ["analyzerExcludeAssets-1", "analyzerExcludeAssets-2"],
            analyzerHost:           "analyzerHost",
            analyzerLogLevel:       "info",
            analyzerMode:           "static",
            analyzerOpen:           true,
            analyzerPort:           "auto",
            analyzerReportFilename: "analyzerReportFilename",
            analyzerReportTitle:    "analyzerReportTitle",
            clean:                  true,
            config:                 "config",
            context:                "context",
            entry:                  ["entry-1", "entry-2"],
            eslintConfigFile:       "eslintConfigFile",
            eslintEnabled:          true,
            eslintFiles:            "eslintFiles",
            eslintFormatter:        "codeframe",
            filename:               "filename",
            htmlx:                  "aot",
            includeFiles:           ["includeFiles-1", "includeFiles-2"],
            index:                  "index",
            logging:                "normal",
            main:                   "main",
            mode:                   "development",
            output:                 "output",
            preferTs:               ["preferTs-1", "preferTs-2"],
            project:                "project",
            publicPath:             "publicPath",
            target:                 "pwa",
            tsconfig:               "tsconfig",
        };

        chai.assert.deepEqual(actual!, expected);
    }

    @test
    public async build(): Promise<void>
    {
        let actual: Required<CliOptions & CliBuildOptions>;

        commandsMock
            .setup("build")
            .call(It.any())
            .callback(x => actual = x as Required<CliOptions & CliBuildOptions>);

        process.argv =
        [
            "",
            "",
            "--clean=true",
            "--config=config",
            "--context=context",
            "--entry=entry-1,entry-2",
            "--eslint-config-file=eslintConfigFile",
            "--eslint-enabled=true",
            "--eslint-files=eslintFiles",
            "--eslint-formatter=codeframe",
            "--filename=filename",
            "--htmlx=aot",
            "--include-files=includeFiles-1,includeFiles-2",
            "--index=index",
            "--logging=normal",
            "--main=main",
            "--mode=development",
            "--output=output",
            "--prefer-ts=true",
            "--project=project",
            "--public-path=publicPath",
            "--target=pwa",
            "--tsconfig=tsconfig",
            "--watch",
        ];

        await import("../bin/build.js");

        const expected: Required<CliOptions & CliBuildOptions> =
        {
            clean:                  true,
            config:                 "config",
            context:                "context",
            entry:                  ["entry-1", "entry-2"],
            eslintConfigFile:       "eslintConfigFile",
            eslintEnabled:          true,
            eslintFiles:            "eslintFiles",
            eslintFormatter:        "codeframe",
            filename:               "filename",
            htmlx:                  "aot",
            includeFiles:           ["includeFiles-1", "includeFiles-2"],
            index:                  "index",
            logging:                "normal",
            main:                   "main",
            mode:                   "development",
            output:                 "output",
            preferTs:               true,
            project:                "project",
            publicPath:             "publicPath",
            target:                 "pwa",
            tsconfig:               "tsconfig",
            watch:                  true,
        };

        chai.assert.deepEqual(actual!, expected);
    }

    @test
    public async serve(): Promise<void>
    {
        let actual: Required<CliOptions & CliDevServerOptions>;

        commandsMock
            .setup("serve")
            .call(It.any())
            .callback(x => actual = x as Required<CliOptions & CliDevServerOptions>);

        process.argv =
        [
            "",
            "",
            "--clean=true",
            "--config=config",
            "--context=context",
            "--devserver-compress=true",
            "--devserver-host=devserverHost",
            "--devserver-hot=true",
            "--devserver-live-reload=true",
            "--devserver-open=true",
            "--devserver-port=8080",
            "--entry=entry-1,entry-2",
            "--eslint-config-file=eslintConfigFile",
            "--eslint-enabled=true",
            "--eslint-files=eslintFiles",
            "--eslint-formatter=codeframe",
            "--filename=filename",
            "--htmlx=aot",
            "--include-files=includeFiles-1,includeFiles-2",
            "--index=index",
            "--logging=normal",
            "--main=main",
            "--mode=development",
            "--output=output",
            "--prefer-ts=true",
            "--project=project",
            "--public-path=publicPath",
            "--target=pwa",
            "--tsconfig=tsconfig",
        ];

        await import("../bin/serve.js");

        const expected: Required<CliOptions & CliDevServerOptions> =
        {
            clean:                          true,
            config:                         "config",
            context:                        "context",
            devserverCompress:              true,
            devserverHost:                  "devserverHost",
            devserverHot:                   true,
            devserverLiveReload:            true,
            devserverOpen:                  true,
            devserverPort:                  8080,
            entry:                          ["entry-1", "entry-2"],
            eslintConfigFile:               "eslintConfigFile",
            eslintEnabled:                  true,
            eslintFiles:                    "eslintFiles",
            eslintFormatter:                "codeframe",
            filename:                       "filename",
            htmlx:                          "aot",
            includeFiles:                   ["includeFiles-1", "includeFiles-2"],
            index:                          "index",
            logging:                        "normal",
            main:                           "main",
            mode:                           "development",
            output:                         "output",
            preferTs:                       true,
            project:                        "project",
            publicPath:                     "publicPath",
            target:                         "pwa",
            tsconfig:                       "tsconfig",
        };

        chai.assert.deepEqual(actual!, expected);
    }
}