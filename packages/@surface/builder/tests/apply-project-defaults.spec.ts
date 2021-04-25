import path                                   from "path";
import { lookupFile }                         from "@surface/io";
import Mock, { It }                           from "@surface/mock";
import { afterEach, beforeEach, suite, test } from "@surface/test-suite";
import chai                                   from "chai";
import chaiAsPromised                         from "chai-as-promised";
import applyProjectDefaults                   from "../internal/apply-project-defaults.js";
import type Project                           from "../internal/types/project";

chai.use(chaiAsPromised);

const lookupFileMock = Mock.of(lookupFile);

const CWD = process.cwd();

const DEFAULT_EXPECTED: Project =
{
    analyzer:
    {
        analyzerMode: "static",
    },
    configurations:
    {
        development:
        {
            cache:
            {
                name: ".cache",
                type: "filesystem",
            },
            optimization:
            {
                chunkIds:             "named",
                concatenateModules:   false,
                emitOnErrors:         false,
                flagIncludedChunks:   false,
                mangleExports:        false,
                mergeDuplicateChunks: false,
                minimize:             false,
                moduleIds:            "named",
                providedExports:      true,
                usedExports:          false,
            },
            performance:
            {
                hints: false,
            },
        },
        production:
        {
            cache:        false,
            optimization:
            {
                chunkIds:             "total-size",
                concatenateModules:   true,
                emitOnErrors:         false,
                flagIncludedChunks:   true,
                mangleExports:        true,
                mergeDuplicateChunks: true,
                minimize:             true,
                moduleIds:            "size",
                providedExports:      true,
                usedExports:          true,
            },
            performance:
            {
                hints: "error",
            },
        },
    },
    context: CWD,
    entry:   "index.js",
    eslint:
    {
        cwd:      CWD,
        enabled:  false,
        files:    `${CWD}/**/*.{js,ts}`,
    },
    filename:   "[name].js",
    mode:       "development",
    output:     path.join(CWD, "dist"),
    publicPath: "/",
    target:     "web",
};

@suite
export default class ApplyProjectDefaultsSpec
{
    @beforeEach
    public beforeEach(): void
    {
        lookupFileMock.lock();
        lookupFileMock.call(It.any());
    }

    @afterEach
    public afterEach(): void
    {
        lookupFileMock.release();
    }

    @test
    public applyDefaultOnEmptyProject(): void
    {
        chai.assert.deepEqual(applyProjectDefaults({ }), DEFAULT_EXPECTED);
    }

    @test
    public applyDefaultOnEmptyProjectWhenDefaultFilesExists(): void
    {
        const TSCONFIG_PATH = path.join(CWD, "tsconfig.json");
        const INDEX_PATH    = path.join(CWD, "index.html");

        const lookups =
        [
            path.join(CWD, ".eslintrc.js"),
            path.join(CWD, ".eslintrc.json"),
            path.join(CWD, ".eslintrc.yml"),
            path.join(CWD, ".eslintrc.yaml"),
        ];

        lookupFileMock.call(lookups).returns(lookups[0]);
        lookupFileMock.call([TSCONFIG_PATH]).returns(TSCONFIG_PATH);
        lookupFileMock.call([INDEX_PATH]).returns(INDEX_PATH);

        const expected: Project =
        {
            ...DEFAULT_EXPECTED,
            eslint:
            {
                ...DEFAULT_EXPECTED.eslint,
                enabled:  true,
                eslintrc: lookups[0],
            },
            index:    INDEX_PATH,
            tsconfig: TSCONFIG_PATH,
        };

        chai.assert.deepEqual(applyProjectDefaults({ }), expected);
    }
}