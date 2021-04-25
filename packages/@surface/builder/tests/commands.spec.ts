/* eslint-disable max-lines-per-function */
import path                                   from "path";
import { isFile, lookupFile }                 from "@surface/io";
import Mock, { It }                           from "@surface/mock";
import { afterEach, beforeEach, suite, test } from "@surface/test-suite";
import chai                                   from "chai";
import Builder                                from "../internal/builder.js";
import Commands                               from "../internal/commands.js";
import { createStats, loadModule }            from "../internal/common.js";
import type CliOptions                        from "../internal/types/cli-options.js";
import type Configuration                     from "../internal/types/configuration.js";

const CWD = process.cwd();
const DIST               = path.join(CWD, "dist");
const CACHE              = path.join(CWD, ".cache");
const ESLINTRC_JS        = path.join(CWD, ".eslintrc.js");
const ESLINTRC_JSON      = path.join(CWD, ".eslintrc.json");
const INDEX_HTML         = path.join(CWD, "index.html");
const SOURCE             = path.join(CWD, "source");
const SRC                = path.join(CWD, "src");
const SURFACE_JS         = path.join(CWD, "surface.js");
const SURFACE_JSON       = path.join(CWD, "surface.json");
const EMPTY_JSON         = path.join(CWD, "empty.json");
const TEMPLATE_HTML      = path.join(CWD, "template.html");
const TSCONFIG_BASE_JSON = path.join(CWD, "tsconfig.base.json");
const TSCONFIG_HTML      = path.join(CWD, "tsconfig.json");
const WWW                = path.join(CWD, "www");

const isFileMock       = Mock.of(isFile);
const lookupFileMock   = Mock.of(lookupFile);
const compilerCtorMock = Mock.of(Builder);
const loadModuleMock   = Mock.of(loadModule);

const DEFAULT_EXPECTED: Configuration =
{
    devServer: { },
    projects:
    {
        default:
        {
            analyzer: { },
            eslint:   { },
        },
    },
};

const CONFIGURATION_JSON: Configuration =
{
    devServer: { },
    projects:
    {
        main:
        {
            analyzer:       { },
            configurations:
            {
                development:
                {
                    cache:
                    {
                        cacheDirectory: ".cache",
                        type:           "filesystem",
                    },
                },
                production:
                {
                    cache: false,
                },
            },
            context:      "src",
            entry:        ["index.js"],
            eslint:
            {
                eslintrc: ".eslintrc.json",
            },
            filename:       "[name].[fullhash].js",
            includeFiles:   ["fonts", "images"],
            index:          "template.html",
            mode:           "production",
            output:         "www",
            preferTs:       ["src/**/*"],
            publicPath:     "app",
            target:         "web",
            tsconfig:       "tsconfig.base.json",
        },
        static:
        {
            entry: "static/index.js",
        },
    },
};

const CONFIGURATION_JS: Configuration =
{
    devServer: { },
    hooks:     { },
    projects:
    {
        main:
        {
            analyzer:     { },
            context:      "src",
            entry:        ["index.js"],
            eslint:
            {
                eslintrc: ".eslintrc.json",
            },
            filename:     "[name].[fullhash].js",
            includeFiles: ["fonts", "images"],
            index:        "template.html",
            mode:         "production",
            output:       "www",
            preferTs:     ["srs/**/*"],
            publicPath:   "app",
            target:       "web",
            tsconfig:     "tsconfig.production.json",
        },
    },
};

@suite
export default class CommandsSpec
{
    @beforeEach
    public beforeEach(): void
    {
        isFileMock.lock();
        lookupFileMock.lock();
        loadModuleMock.lock();

        isFileMock.call(EMPTY_JSON).returns(true);
        isFileMock.call(SURFACE_JSON).returns(true);
        isFileMock.call(SURFACE_JS).returns(true);
        isFileMock.call(It.any());

        lookupFileMock.call(It.any());

        loadModuleMock.call(EMPTY_JSON).returns(Promise.resolve({ }));
        loadModuleMock.call(SURFACE_JS).returns(Promise.resolve({ __esModule: true, default: CONFIGURATION_JS }));
        loadModuleMock.call(SURFACE_JSON).returns(Promise.resolve(CONFIGURATION_JSON));
        loadModuleMock.call(It.any());
    }

    @afterEach
    public afterEach(): void
    {
        compilerCtorMock.release();
        isFileMock.release();
        loadModuleMock.release();
        lookupFileMock.release();
    }

    @test
    public async analyze(): Promise<void>
    {
        const expected = DEFAULT_EXPECTED;

        let actual: Configuration;

        compilerCtorMock
            .setup("analyze")
            .call(It.any())
            .callback(x => actual = x)
            .returns(Promise.resolve());

        await Commands.analyze({ }),

        chai.assert.deepEqual(actual!, expected);
    }

    @test
    public async build(): Promise<void>
    {
        const expected1 = DEFAULT_EXPECTED;

        let actual1: Configuration;

        compilerCtorMock
            .setup("run")
            .call(It.any())
            .callback(x => actual1 = x)
            .returns(Promise.resolve());

        await Commands.build({ config: "." }),

        chai.assert.deepEqual(actual1!, expected1, "build 1");

        const expected2: Configuration =
        {
            devServer: { },
            projects:  { },
        };

        let actual2: Configuration;

        compilerCtorMock
            .setup("run")
            .call(It.any())
            .callback(x => actual2 = x)
            .returns(Promise.resolve());

        await Commands.build({ config: EMPTY_JSON }),

        chai.assert.deepEqual(actual2!, expected2, "build 2");

        const expected4 = CONFIGURATION_JS;

        let actual4: Configuration;

        compilerCtorMock
            .setup("run")
            .call(It.any())
            .callback(x => actual4 = x)
            .returns(Promise.resolve());

        await Commands.build({ config: SURFACE_JS }),

        chai.assert.deepEqual(actual4!, expected4, "build 4");

        const expected5: Configuration =
        {
            devServer: { },
            projects:
            {
                main:
                {
                    analyzer:       { },
                    configurations:
                    {
                        development:
                        {
                            cache:
                            {
                                cacheDirectory: CACHE,
                                type:           "filesystem",
                            },
                        },
                        production:
                        {
                            cache: false,
                        },
                    },
                    context:      SRC,
                    entry:        ["index.js"],
                    eslint:
                    {
                        eslintrc: ESLINTRC_JSON,
                    },
                    filename:     "[name].[fullhash].js",
                    includeFiles: ["fonts", "images"],
                    index:        TEMPLATE_HTML,
                    mode:         "production",
                    output:       WWW,
                    preferTs:     ["src/**/*"],
                    publicPath:   "app",
                    target:       "web",
                    tsconfig:     TSCONFIG_BASE_JSON,
                },
                static:
                {
                    analyzer: { },
                    entry:    "static/index.js",
                    eslint:   { },
                },
            },
        };

        let actual5: Configuration;

        compilerCtorMock
            .setup("run")
            .call(It.any())
            .callback(x => actual5 = x)
            .returns(Promise.resolve());

        await Commands.build({ config: SURFACE_JSON }),

        chai.assert.deepEqual(actual5!, expected5, "build 5");

        const expected6: Configuration =
        {
            devServer:
            {
                stats: createStats(true),
            },
            logging:  true,
            main:     "static",
            projects:
            {
                main:   CONFIGURATION_JSON.projects!.main,
                static:
                {
                    analyzer: { },
                    context:  SOURCE,
                    entry:    ["main.ts"],
                    eslint:
                    {
                        enabled:  true,
                        eslintrc: ESLINTRC_JS,
                    },
                    filename:     "[name].js",
                    includeFiles: ["static/**/*.js"],
                    index:        INDEX_HTML,
                    mode:         "development",
                    output:       DIST,
                    preferTs:     true,
                    publicPath:   "path",
                    target:       "pwa",
                    tsconfig:     TSCONFIG_HTML,
                },
            },
        };

        let actual6: Configuration;

        compilerCtorMock
            .setup("run")
            .call(It.any())
            .callback(x => actual6 = x)
            .returns(Promise.resolve());

        const cliOptions: CliOptions =
        {
            config:       SURFACE_JSON,
            context:      "source",
            entry:        ["main.ts"],
            eslintrc:     ".eslintrc.js",
            filename:     "[name].js",
            includeFiles: ["static/**/*.js"],
            index:        "index.html",
            logging:      true,
            main:         "static",
            mode:         "development",
            output:       "dist",
            preferTs:     true,
            project:      "static",
            publicPath:   "path",
            target:       "pwa",
            tsconfig:     "tsconfig.json",
        };

        await Commands.build(cliOptions),

        chai.assert.deepEqual(actual6!, expected6, "build 6");
    }

    @test
    public async buildAndWatch(): Promise<void>
    {
        const expected = DEFAULT_EXPECTED;

        let actual: Configuration;

        compilerCtorMock
            .setup("watch")
            .call(It.any())
            .callback(x => actual = x)
            .returns(Promise.resolve({ close: async () => Promise.resolve() }));

        await Commands.build({ watch: true }),

        chai.assert.deepEqual(actual!, expected);
    }

    @test
    public async serve(): Promise<void>
    {
        const expected = DEFAULT_EXPECTED;

        let actual: Configuration;

        compilerCtorMock
            .setup("serve")
            .call(It.any())
            .callback(x => actual = x)
            .returns(Promise.resolve({ close: async () => Promise.resolve() }));

        await Commands.serve({ }),

        chai.assert.deepEqual(actual!, expected);
    }
}