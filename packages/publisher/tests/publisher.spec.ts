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
import Status                                                                    from "../internal/enums/status.js";
import NpmRepository                                                             from "../internal/npm-repository.js";
import Publisher                                                                 from "../internal/publisher.js";
import
{
    type BumpScenario,
    invalidScenarios as bumpInvalidScenarios,
    validScenarios as bumpValidScenarios,
} from "./publisher.bump.scn.js";
import
{
    type PublishScenario,
    validScenarios as publishValidScenarios,
} from "./publisher.publish.scn.js";
import
{
    type UnpublishScenario,
    validScenarios as unpublishValidScenarios,
} from "./publisher.unpublish.scn.js";
import type VirtualDirectory from "./types/virtual-directory.js";

type PackageJson = _PackageJson & { workspaces?: string[] };

chai.use(chaiAsPromised);

const executeMock       = Mock.of(execute);
const existsSyncMock    = Mock.of(existsSync);
const loggerMock        = Mock.instance<Logger>();
const LoggerMock        = Mock.of(Logger);
const npmRepositoryMock = Mock.instance<NpmRepository>();
const NpmRepositoryMock = Mock.of(NpmRepository);
const packMock          = Mock.of(pack);
const readdirMock       = Mock.of(readdir);
const readFileMock      = Mock.of(readFile);
const statMock          = Mock.of(stat);
const writeFileMock     = Mock.of(writeFile);

executeMock.call(It.any(), It.any()).resolve();

loggerMock.setup("debug").call(It.any());
loggerMock.setup("error").call(It.any());
loggerMock.setup("fatal").call(It.any());
loggerMock.setup("info").call(It.any());
loggerMock.setup("trace").call(It.any());
loggerMock.setup("warn").call(It.any());

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

    private setupVirtualRegistry(registry: Record<string, Status>): void
    {
        npmRepositoryMock
            .setup("getStatus")
            .call(It.any())
            .returnsFactory(async x => Promise.resolve(registry[x.name] ?? Status.New));
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

    @beforeEach
    public beforeEach(): void
    {
        LoggerMock.new(It.any()).returns(loggerMock.proxy);
        NpmRepositoryMock.new(It.any(), It.any()).returns(npmRepositoryMock.proxy);
        packMock.call(It.any()).resolve(Buffer.from([]));

        LoggerMock.lock();
        NpmRepositoryMock.lock();

        existsSyncMock.lock();
        packMock.lock();
        readdirMock.lock();
        readFileMock.lock();
        statMock.lock();
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
        writeFileMock.release();
    }

    @batchTest(bumpValidScenarios, x => `[bump]: ${x.message}`, x => x.skip)
    @shouldPass
    public async bumpValidScenarios(scenario: BumpScenario): Promise<void>
    {
        this.setupVirtualDirectory(scenario.directory);

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

    @batchTest(publishValidScenarios, x => `[publish]: ${x.message}`, x => x.skip)
    @shouldPass
    public async publishValidScenarios(scenario: PublishScenario): Promise<void>
    {
        this.setupVirtualDirectory(scenario.directory);
        this.setupVirtualRegistry(scenario.registry);

        const actual: string[] = [];

        writeFileMock.call(It.any(), It.any()).resolve();

        npmRepositoryMock.setup("publish").call(It.any(), It.any(), It.any())
            .callback(x => actual.push(`${x.name}@${x.version}`))
            .resolve();

        await chai.assert.isFulfilled(new Publisher(scenario.options).publish(...scenario.args));

        chai.assert.deepEqual(actual, scenario.expected.published);
    }

    @batchTest(unpublishValidScenarios, x => `[unpublish]: ${x.message}`, x => x.skip)
    @shouldPass
    public async unpublishValidScenarios(scenario: UnpublishScenario): Promise<void>
    {
        this.setupVirtualDirectory(scenario.directory);
        this.setupVirtualRegistry(scenario.registry);

        const actual: string[] = [];

        npmRepositoryMock.setup("unpublish").call(It.any(), It.any())
            .callback(x => actual.push(x.name))
            .resolve();

        await chai.assert.isFulfilled(new Publisher(scenario.options).unpublish("latest"));

        chai.assert.deepEqual(actual, scenario.expected.unpublished);
    }

    @batchTest(bumpInvalidScenarios, x => x.message, x => x.skip)
    @shouldFail
    public async bumpInvalidScenarios(scenario: BumpScenario): Promise<void>
    {
        this.setupVirtualDirectory(scenario.directory);

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

        this.setupVirtualDirectory(directory);

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

        this.setupVirtualDirectory(directory);
        this.setupVirtualRegistry({ "package-a": Status.InRegistry });

        npmRepositoryMock.setup("unpublish").call(It.any(), It.any()).reject();

        await chai.assert.isRejected(new Publisher({ packages: ["packages/*"] }).unpublish("latest"));
    }
}
