import { type Stats, existsSync }                                                from "fs";
import { readFile, readdir, stat, writeFile }                                    from "fs/promises";
import path                                                                      from "path";
import type { PackageJson as _PackageJson }                                      from "@npm/types";
import Logger                                                                    from "@surface/logger";
import Mock, { It }                                                              from "@surface/mock";
import { execute }                                                               from "@surface/rwx";
import { afterEach, batchTest, beforeEach, shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import chai                                                                      from "chai";
import chaiAsPromised                                                            from "chai-as-promised";
import pack                                                                      from "libnpmpack";
import { timestamp }                                                             from "../internal/common.js";
import NpmService                                                                from "../internal/npm-service.js";
import Publisher                                                                 from "../internal/publisher.js";
import
{
    type BumpScenario,
    invalidBumpScenarios,
    validBumpScenarios,
} from "./publisher.bump.scn.js";
import { type ChangedScenario, validChangedScenarios } from "./publisher.changed.scn.js";
import
{
    type PublishScenario,
    validPublishScenarios,
} from "./publisher.publish.scn.js";
import
{
    type UnpublishScenario,
    validUnpublishScenarios,
} from "./publisher.unpublish.scn.js";
import type VirtualDirectory from "./types/virtual-directory.js";
import type VirtualRegistry  from "./types/virtual-registry.js";

type PackageJson = _PackageJson & { workspaces?: string[] };

chai.use(chaiAsPromised);

const executeMock       = Mock.of(execute);
const existsSyncMock    = Mock.of(existsSync);
const loggerMock        = Mock.instance<Logger>();
const LoggerMock        = Mock.of(Logger);
const npmRepositoryMock = Mock.instance<NpmService>();
const NpmRepositoryMock = Mock.of(NpmService);
const packMock          = Mock.of(pack);
const readdirMock       = Mock.of(readdir);
const readFileMock      = Mock.of(readFile);
const statMock          = Mock.of(stat);
const timestampMock     = Mock.of(timestamp);
const writeFileMock     = Mock.of(writeFile);

executeMock.call(It.any(), It.any()).resolve();

loggerMock.setup("debug").call(It.any());
loggerMock.setup("error").call(It.any());
loggerMock.setup("fatal").call(It.any());
loggerMock.setup("info").call(It.any());
loggerMock.setup("trace").call(It.any());
loggerMock.setup("warn").call(It.any());

const PACKAGE_NAME_PATTERN = /(?:@[a-z0-9-]+\/)?([a-z0-9-]+)(?:@([a-z0-9-]+))?/;

const getPackageName = (spec: string): [name: string, tag?: string] =>
{
    const [, name, tag] = PACKAGE_NAME_PATTERN.exec(spec) ?? [, spec];

    return [name!, tag];
};

@suite
export default class PublisherSpec
{
    private readonly directoryTree = new Map<string, Set<string>>();

    private createFile(filepath: string, content: string): void
    {
        statMock.call(filepath).resolve({ isFile: () => true, isDirectory: () => false } as Stats);
        existsSyncMock.call(filepath).returns(true);

        const buffer = Buffer.from(content);

        readFileMock.call(filepath).resolve(buffer);
    }

    private resolveFileTree(filepath: string): void
    {
        const parent = path.dirname(filepath);
        const child  = path.basename(filepath);

        let entries = this.directoryTree.get(parent);

        if (!entries)
        {
            this.directoryTree.set(parent, entries = new Set());

            statMock.call(parent).resolve({ isFile: () => false, isFIFO: () => false, isDirectory: () => true } as Stats);
            readdirMock.call(parent).returnsFactory(async () => Promise.resolve(Array.from(entries!)));

            this.resolveFileTree(parent);
        }

        if (child)
        {
            entries.add(child);
        }
    }

    private setup(scenario: { registry: VirtualRegistry, directory: VirtualDirectory }): void
    {
        this.setupVirtualDirectory(scenario.directory);
        this.setupVirtualRegistry(scenario.registry);
    }

    private setupVirtualDirectory(directory: VirtualDirectory, parent: string = process.cwd()): void
    {
        readdirMock.call(parent).resolve([]);

        this.resolveFileTree(parent);

        for (const [key, entry] of Object.entries(directory))
        {
            const filepath = path.isAbsolute(key) ? key : path.join(parent, key);

            if (typeof entry == "string")
            {
                this.createFile(filepath, entry);
            }
            else
            {
                this.setupVirtualDirectory(entry, filepath);
            }

            this.resolveFileTree(filepath);
        }
    }

    private setupVirtualRegistry(registry: VirtualRegistry): void
    {
        npmRepositoryMock
            .setup("get")
            .call(It.any())
            .returnsFactory
            (
                async spec =>
                {
                    const [name, tag] = getPackageName(spec);

                    return Promise.resolve(registry[name!]?.remote?.[tag ?? "latest"] as Awaited<ReturnType<NpmService["get"]>> ?? null);
                },
            );

        npmRepositoryMock
            .setup("isPublished")
            .call(It.any())
            .returnsFactory(async x => Promise.resolve(registry[x.name]?.isPublished ?? false));

        npmRepositoryMock
            .setup("hasChanges")
            .call(It.any(), It.any())
            .returnsFactory
            (
                async (_, rightSpec) =>
                {
                    const [name] = getPackageName(rightSpec);

                    return Promise.resolve(registry[name!]?.hasChanges ?? false);
                },
            );
    }

    @beforeEach
    public beforeEach(): void
    {
        LoggerMock.new(It.any()).returns(loggerMock.proxy);
        NpmRepositoryMock.new(It.any(), It.any()).returns(npmRepositoryMock.proxy);
        packMock.call(It.any()).resolve(Buffer.from([]));
        timestampMock.call().returns("202201010000");

        LoggerMock.lock();
        NpmRepositoryMock.lock();

        existsSyncMock.lock();
        packMock.lock();
        readdirMock.lock();
        readFileMock.lock();
        statMock.lock();
        timestampMock.lock();
        writeFileMock.lock();
    }

    @afterEach
    public afterEach(): void
    {
        this.directoryTree.clear();

        LoggerMock.release();
        NpmRepositoryMock.release();

        existsSyncMock.release();
        packMock.release();
        readdirMock.release();
        readFileMock.release();
        statMock.release();
        timestampMock.release();
        writeFileMock.release();
    }

    @batchTest(validBumpScenarios, x => `[bump]: ${x.message}`, x => x.skip)
    @shouldPass
    public async validBumpScenarios(scenario: BumpScenario): Promise<void>
    {
        this.setup(scenario);

        const actual: Record<string, PackageJson> = { };

        writeFileMock.call(It.any(), It.any())
            .callback
            (
                (_, data) =>
                {
                    const manifest = JSON.parse(data as string) as PackageJson;

                    actual[manifest.name] = manifest;
                },
            );

        await chai.assert.isFulfilled(new Publisher(scenario.options).bump(...scenario.args));

        chai.assert.deepEqual(actual, scenario.expected);
    }

    @batchTest(validChangedScenarios, x => `[changed]: ${x.message}`, x => x.skip)
    @shouldPass
    public async validChangedScenarios(scenario: ChangedScenario): Promise<void>
    {
        this.setup(scenario);

        const actual = await new Publisher(scenario.options).changed(...scenario.args);

        chai.assert.deepEqual(actual, scenario.expected);
    }

    @batchTest(validPublishScenarios, x => `[publish]: ${x.message}`, x => x.skip)
    @shouldPass
    public async validPublishScenarios(scenario: PublishScenario): Promise<void>
    {
        this.setup(scenario);

        const actual: string[] = [];

        writeFileMock.call(It.any(), It.any()).resolve();

        npmRepositoryMock.setup("publish").call(It.any(), It.any(), It.any())
            .callback(x => actual.push(`${x.name}@${x.version}`))
            .resolve();

        await chai.assert.isFulfilled(new Publisher(scenario.options).publish(...scenario.args));

        chai.assert.deepEqual(actual, scenario.expected.published);
    }

    @batchTest(validUnpublishScenarios, x => `[unpublish]: ${x.message}`, x => x.skip)
    @shouldPass
    public async validUnpublishScenarios(scenario: UnpublishScenario): Promise<void>
    {
        this.setup(scenario);

        const actual: string[] = [];

        npmRepositoryMock.setup("unpublish").call(It.any(), It.any())
            .callback(x => actual.push(x.name))
            .resolve();

        await chai.assert.isFulfilled(new Publisher(scenario.options).unpublish("latest"));

        chai.assert.deepEqual(actual, scenario.expected.unpublished);
    }

    @batchTest(invalidBumpScenarios, x => x.message, x => x.skip)
    @shouldFail
    public async invalidBumpScenarios(scenario: BumpScenario): Promise<void>
    {
        this.setup(scenario);

        writeFileMock.call(It.any(), It.any()).resolve();

        await chai.assert.isRejected(new Publisher(scenario.options).bump(...scenario.args));
    }

    @test("[publishing]: Publishing should fail")
    @shouldFail
    public async publishingShouldFail(): Promise<void>
    {
        const directory: VirtualDirectory =
        {
            "./packages/package-a/package.json": "{ }",
        };

        this.setup({ directory, registry: { } });

        npmRepositoryMock.setup("publish").call(It.any(), It.any(), It.any()).reject();

        writeFileMock.call(It.any(), It.any()).resolve();

        await chai.assert.isRejected(new Publisher({ packages: ["packages/*"] }).publish("latest"));
    }

    @test("[unpublishing]: Unpublishing should fail")
    @shouldFail
    public async unpublishingShouldFail(): Promise<void>
    {
        const directory: VirtualDirectory =
        {
            "./packages/package-a/package.json": "{ \"name\": \"package-a\" }",
        };

        this.setup({ directory, registry: { "package-a": { isPublished: true, hasChanges: true } } });

        npmRepositoryMock.setup("unpublish").call(It.any(), It.any()).reject();

        await chai.assert.isRejected(new Publisher({ packages: ["packages/*"] }).unpublish("latest"));
    }
}
