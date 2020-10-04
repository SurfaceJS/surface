/* eslint-disable array-element-newline */
/* eslint-disable import/no-namespace */
import Mock, { It }                           from "@surface/mock";
import { afterEach, beforeEach, suite, test } from "@surface/test-suite";
import { assert }                             from "chai";
import Tasks, * as tasksNS                    from "../internal/tasks";
import AnalyzerOptions                        from "../internal/types/analyzer-options";
import BuildOptions                           from "../internal/types/build-options";
import DevServerOptions                       from "../internal/types/dev-serve-options";
import Options                                from "../internal/types/options";

const tasksMock = Mock.newable<typeof Tasks>();

@suite
export default class BinSpec
{
    @beforeEach
    public beforeEach(): void
    {
        Mock.module(tasksNS, { default: tasksMock.proxy });
    }

    @afterEach
    public afterEach(): void
    {
        Mock.restore(tasksNS);
    }

    @test
    public async analyze(): Promise<void>
    {
        let actual: Required<Options & AnalyzerOptions>;

        tasksMock
            .setup("analyze")
            .call(It.any())
            .callback(x => actual = x as Required<Options & AnalyzerOptions>);

        process.argv =
        [
            "",                  "",
            "--analyzer-mode",   "server",
            "--context",         ".",
            "--default-sizes",   "parsed",
            "--entry",           ".",
            "--eslintrc",        ".",
            "--exclude",         ".",
            "--filename",        ".",
            "--force-ts",        "true",
            "--host",            ".",
            "--html-template",   ".",
            "--log-level",       "info",
            "--mode",            "development",
            "--open",            ".",
            "--output",          ".",
            "--port",            "auto",
            "--project",         ".",
            "--public-path",     ".",
            "--report-filename", ".",
            "--tsconfig",        ".",
            "--webpack-config",  ".",
        ];

        await import("../bin/analyze");

        const expected: Required<Options & AnalyzerOptions> =
        {
            analyzerMode:   "server",
            context:        ".",
            defaultSizes:   "parsed",
            entry:          ["."],
            eslintrc:       ".",
            exclude:        ["."],
            filename:       ".",
            forceTs:        true,
            host:           ".",
            htmlTemplate:   ".",
            logLevel:       "info",
            mode:           "development",
            open:           false,
            output:         ".",
            port:           "auto",
            project:        ".",
            publicPath:     ".",
            reportFilename: ".",
            tsconfig:       ".",
            webpackConfig:  ".",
        };

        assert.deepEqual(actual!, expected);
    }

    @test
    public async build(): Promise<void>
    {
        let actual: Required<Options & BuildOptions>;

        tasksMock
            .setup("build")
            .call(It.any())
            .callback(x => actual = x as Required<Options & BuildOptions>);

        process.argv =
        [
            "",                 "",
            "--context",        ".",
            "--entry",          ".",
            "--eslintrc",       ".",
            "--filename",       ".",
            "--force-ts",       "true",
            "--hot",            "true",
            "--html-template",  ".",
            "--log-level",      "errors-only",
            "--mode",           "development",
            "--output",         ".",
            "--project",        ".",
            "--public-path",    ".",
            "--tsconfig",       ".",
            "--watch",          "true",
            "--webpack-config", ".",
        ];

        await import("../bin/build");

        const expected: Required<Options & BuildOptions> =
        {
            context:       ".",
            entry:         ["."],
            eslintrc:      ".",
            filename:      ".",
            forceTs:       true,
            hot:           true,
            htmlTemplate:  ".",
            logLevel:      "errors-only",
            mode:          "development",
            output:        ".",
            project:       ".",
            publicPath:    ".",
            tsconfig:      ".",
            watch:         true,
            webpackConfig: ".",
        };

        assert.deepEqual(actual!, expected);
    }

    @test
    public async clean(): Promise<void>
    {
        let actual: boolean;

        tasksMock
            .setup("clean")
            .call()
            .callback(() => actual = true);

        process.argv =
        [
            "", "",
        ];

        await import("../bin/clean");

        assert.isTrue(actual!);
    }

    @test
    public async serve(): Promise<void>
    {
        let actual: Required<Options & DevServerOptions>;

        tasksMock
            .setup("serve")
            .call(It.any())
            .callback(x => actual = x as Required<Options & DevServerOptions>);

        process.argv =
        [
            "",                 "",
            "--context",        ".",
            "--entry",          ".",
            "--eslintrc",       ".",
            "--filename",       ".",
            "--force-ts",       "true",
            "--host",           "localhost",
            "--hot",            "true",
            "--html-template",  ".",
            "--log-level",      "errors-only",
            "--output",         ".",
            "--port",           "8080",
            "--project",        ".",
            "--public-path",    ".",
            "--tsconfig",       ".",
            "--webpack-config", ".",
        ];

        await import("../bin/serve");

        const expected: Required<Omit<Options, "mode"> & DevServerOptions> =
        {
            context:       ".",
            entry:         ["."],
            eslintrc:      ".",
            filename:      ".",
            forceTs:       true,
            host:          "localhost",
            hot:           true,
            htmlTemplate:  ".",
            logLevel:      "errors-only",
            output:        ".",
            port:          8080,
            project:       ".",
            publicPath:    ".",
            tsconfig:      ".",
            webpackConfig: ".",
        };

        assert.deepEqual(actual!, expected);
    }
}