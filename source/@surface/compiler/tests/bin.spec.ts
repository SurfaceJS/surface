/* eslint-disable array-element-newline */
import Mock, { It }                           from "@surface/mock";
import { afterEach, beforeEach, suite, test } from "@surface/test-suite";
import chai                                   from "chai";
import Tasks                                  from "../internal/tasks.js";
import type AnalyzerOptions                   from "../internal/types/analyzer-options";
import type BuildOptions                      from "../internal/types/build-options";
import type DevServerOptions                  from "../internal/types/dev-serve-options";
import type Options                           from "../internal/types/options";

const tasksMock = Mock.of(Tasks)!;

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
            "--copy-files",      "**/foo/*.js,**/bar/*.js",
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
            "--use-workbox",     "true",
            "--webpack-config",  ".",
        ];

        await import("../bin/analyze.js");

        const expected: Required<Options & AnalyzerOptions> =
        {
            analyzerMode:   "server",
            context:        ".",
            copyFiles:      ["**/foo/*.js", "**/bar/*.js"],
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
            useWorkbox:     true,
            webpackConfig:  ".",
        };

        chai.assert.deepEqual(actual!, expected);
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
            "--copy-files",     "**/foo/*.js,**/bar/*.js",
            "--entry",          ".",
            "--eslintrc",       ".",
            "--filename",       ".",
            "--force-ts",       "true",
            "--html-template",  ".",
            "--log-level",      "errors-only",
            "--mode",           "development",
            "--output",         ".",
            "--project",        ".",
            "--public-path",    ".",
            "--tsconfig",       ".",
            "--watch",          "true",
            "--use-workbox",    "true",
            "--webpack-config", ".",
        ];

        await import("../bin/build.js");

        const expected: Required<Options & BuildOptions> =
        {
            context:       ".",
            copyFiles:     ["**/foo/*.js", "**/bar/*.js"],
            entry:         ["."],
            eslintrc:      ".",
            filename:      ".",
            forceTs:       true,
            htmlTemplate:  ".",
            logLevel:      "errors-only",
            mode:          "development",
            output:        ".",
            project:       ".",
            publicPath:    ".",
            tsconfig:      ".",
            useWorkbox:    true,
            watch:         true,
            webpackConfig: ".",
        };

        chai.assert.deepEqual(actual!, expected);
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
            "--copy-files",     "**/foo/*.js,**/bar/*.js",
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
            "--use-workbox",    "true",
            "--webpack-config", ".",
        ];

        await import("../bin/serve.js");

        const expected: Required<Omit<Options, "mode"> & DevServerOptions> =
        {
            context:       ".",
            copyFiles:     ["**/foo/*.js", "**/bar/*.js"],
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
            useWorkbox:    true,
            webpackConfig: ".",
        };

        chai.assert.deepEqual(actual!, expected);
    }
}