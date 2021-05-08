/* eslint-disable max-lines-per-function */
import path                                   from "path";
import { isDirectory, lookupFile }            from "@surface/io";
import Mock, { It }                           from "@surface/mock";
import { afterEach, beforeEach, suite, test } from "@surface/test-suite";
import chai                                   from "chai";
import Builder                                from "../internal/builder.js";
import Commands                               from "../internal/commands.js";
import { createStats, loadModule }            from "../internal/common.js";
import type CliOptions                        from "../internal/types/cli-options.js";
import type Configuration                     from "../internal/types/configuration.js";

const CWD                            = process.cwd();
const DIST                           = path.join(CWD, "dist");
const ESLINTRC_JS                    = path.join(CWD, ".eslintrc.js");
const INDEX_HTML                     = path.join(CWD, "index.html");
const PROJECT                        = path.join(CWD, "project");
const PROJECT_CACHE                  = path.join(CWD, "project", ".cache");
const PROJECT_EMPTY_JSON             = path.join(CWD, "project", "empty.json");
const PROJECT_ESLINTRC_JSON          = path.join(CWD, "project", ".eslintrc.json");
const PROJECT_ESLINTRC_JS            = path.join(CWD, "project", ".eslintrc.js");
const PROJECT_ESLINTRC_YML           = path.join(CWD, "project", ".eslintrc.yml");
const PROJECT_ESLINTRC_YAML          = path.join(CWD, "project", ".eslintrc.yaml");
const PROJECT_SETTINGS_JS            = path.join(CWD, "project", "settings.js");
const PROJECT_SETTINGS_PRODUCTION_JS = path.join(CWD, "project", "settings.production.js");
const PROJECT_SOURCE                 = path.join(CWD, "project", "source");
const PROJECT_SRC                    = path.join(CWD, "project", "src");
const PROJECT_SURFACE_BUILDER_JS     = path.join(CWD, "project", "surface.builder.js");
const PROJECT_SURFACE_BUILDER_JSON   = path.join(CWD, "project", "surface.builder.json");
const PROJECT_TEMPLATE_HTML          = path.join(CWD, "project", "template.html");
const PROJECT_TSCONFIG_BASE_JSON     = path.join(CWD, "project", "tsconfig.base.json");
const TSCONFIG_JSON                  = path.join(CWD, "tsconfig.json");
const WWW                            = path.join(CWD, "www");

const isDirectoryMock  = Mock.of(isDirectory);
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
            analyzer:     { },
            context:      "src",
            entry:        ["index.js"],
            environments:
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
                    cache:     false,
                    overrides:
                    [
                        {
                            replace: "./settings.js",
                            with:    "./settings.production.js",
                        },
                    ],
                },
            },
            eslint:
            {
                configFile: ".eslintrc.json",
            },
            filename:       "[name].[fullhash].js",
            includeFiles:   ["fonts", "images"],
            index:          "template.html",
            mode:           "production",
            output:         "../www",
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
                configFile: ".eslintrc.json",
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
        isDirectoryMock.lock();
        lookupFileMock.lock();
        loadModuleMock.lock();

        lookupFileMock.call
        ([
            PROJECT_ESLINTRC_JS,
            PROJECT_ESLINTRC_JSON,
            PROJECT_ESLINTRC_YML,
            PROJECT_ESLINTRC_YAML,
        ]).returns(PROJECT_ESLINTRC_JS);

        isDirectoryMock.call(CWD).returns(true);

        loadModuleMock.call(PROJECT_EMPTY_JSON).returns(Promise.resolve({ }));
        loadModuleMock.call(PROJECT_SURFACE_BUILDER_JS).returns(Promise.resolve({ __esModule: true, default: CONFIGURATION_JS }));
        loadModuleMock.call(PROJECT_SURFACE_BUILDER_JSON).returns(Promise.resolve(CONFIGURATION_JSON));
        loadModuleMock.call(It.any());
    }

    @afterEach
    public afterEach(): void
    {
        isDirectoryMock.release();
        compilerCtorMock.release();
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

        await Commands.build({ config: PROJECT_EMPTY_JSON }),

        chai.assert.deepEqual(actual2!, expected2, "build 2");

        const expected4 = CONFIGURATION_JS;

        let actual4: Configuration;

        compilerCtorMock
            .setup("run")
            .call(It.any())
            .callback(x => actual4 = x)
            .returns(Promise.resolve());

        await Commands.build({ config: PROJECT_SURFACE_BUILDER_JS }),

        chai.assert.deepEqual(actual4!, expected4, "build 4");

        const expected5: Configuration =
        {
            devServer: { },
            projects:
            {
                main:
                {
                    analyzer:     { },
                    context:      PROJECT_SRC,
                    entry:        ["index.js"],
                    environments:
                    {
                        development:
                        {
                            cache:
                            {
                                cacheDirectory: PROJECT_CACHE,
                                type:           "filesystem",
                            },
                        },
                        production:
                        {
                            cache:     false,
                            overrides:
                            [
                                {
                                    replace: PROJECT_SETTINGS_JS,
                                    with:    PROJECT_SETTINGS_PRODUCTION_JS,
                                },
                            ],
                        },
                    },
                    eslint:
                    {
                        configFile: PROJECT_ESLINTRC_JSON,
                    },
                    filename:     "[name].[fullhash].js",
                    includeFiles: ["fonts", "images"],
                    index:        PROJECT_TEMPLATE_HTML,
                    mode:         "production",
                    output:       WWW,
                    preferTs:     [path.join(PROJECT, "src/**/*")],
                    publicPath:   "app",
                    target:       "web",
                    tsconfig:     PROJECT_TSCONFIG_BASE_JSON,
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

        await Commands.build({ config: PROJECT_SURFACE_BUILDER_JSON }),

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
                    context:  PROJECT_SOURCE,
                    entry:    ["main.ts"],
                    eslint:
                    {
                        configFile: ESLINTRC_JS,
                        enabled:    true,
                        files:      "./project/source/**/*.{ts}",
                    },
                    filename:     "[name].js",
                    includeFiles: ["static/**/*.js"],
                    index:        INDEX_HTML,
                    mode:         "development",
                    output:       DIST,
                    preferTs:     true,
                    publicPath:   "path",
                    target:       "pwa",
                    tsconfig:     TSCONFIG_JSON,
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
            config:           PROJECT_SURFACE_BUILDER_JSON,
            context:          "project/source",
            entry:            ["main.ts"],
            eslintConfigFile: ".eslintrc.js",
            eslintEnabled:    true,
            eslintFiles:      "./project/source/**/*.{ts}",
            filename:         "[name].js",
            includeFiles:     ["static/**/*.js"],
            index:            "index.html",
            logging:          true,
            main:             "static",
            mode:             "development",
            output:           "dist",
            preferTs:         true,
            project:          "static",
            publicPath:       "path",
            target:           "pwa",
            tsconfig:         "tsconfig.json",
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