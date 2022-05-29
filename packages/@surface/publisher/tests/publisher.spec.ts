import { type Stats, existsSync }                                                 from "fs";
import { readFile, readdir, stat, writeFile }                                     from "fs/promises";
import path                                                                       from "path";
import Logger                                                                     from "@surface/logger";
import Mock, { It }                                                               from "@surface/mock";
import { afterEach, batchTest, beforeEach, shouldFail, shouldPass, suite }        from "@surface/test-suite";
import chai                                                                       from "chai";
import chaiAsPromised                                                             from "chai-as-promised";
import type { Manifest }                                                          from "pacote";
import pacote, { type ManifestResult }                                            from "pacote";
import Publisher                                                                  from "../internal/publisher.js";
import { type Scenario, type VirtualDirectory, invalidScenarios, validScenarios } from "./publisher.expectations.js";

chai.use(chaiAsPromised);

const existsSyncMock  = Mock.of(existsSync);
const statMock        = Mock.of(stat);
const loggerMock      = Mock.instance<Logger>();
const LoggerMock      = Mock.of(Logger);
const pacoteMock      = Mock.of(pacote);
const readdirMock     = Mock.of(readdir);
const readFileMock    = Mock.of(readFile);
const writeFileMock   = Mock.of(writeFile);

loggerMock.setup("debug").call(It.any());
loggerMock.setup("error").call(It.any());
loggerMock.setup("fatal").call(It.any());
loggerMock.setup("info").call(It.any());
loggerMock.setup("trace").call(It.any());
loggerMock.setup("warn").call(It.any());

@suite
export default class SuiteSpec
{
    private readonly directoryTree = new Map<string, Set<string>>();

    private createFile(filepath: string, content: string): void
    {
        statMock.call(filepath).resolve({ isDirectory: () => false } as Stats);
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

            statMock.call(parent).resolve({ isDirectory: () => true } as Stats);
            readdirMock.call(parent).returnsFactory(async () => Promise.resolve(Array.from(entries!)));

            this.resolveFileTree(parent);
        }

        if (child)
        {
            entries.add(child);
        }
    }

    private setupVirtualRegistry(registry: Record<string, ManifestResult>): void
    {
        for (const [key, value] of Object.entries(registry))
        {
            pacoteMock.setup("manifest").call(key, It.any()).resolve(value);
        }
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
        LoggerMock.lock();

        existsSyncMock.lock();
        statMock.lock();
        pacoteMock.lock();
        readdirMock.lock();
        readFileMock.lock();
        writeFileMock.lock();
    }

    @afterEach
    public afterEach(): void
    {
        this.directoryTree.clear();

        LoggerMock.release();

        existsSyncMock.release();
        statMock.release();
        pacoteMock.release();
        readdirMock.release();
        readFileMock.release();
        writeFileMock.release();
    }

    @batchTest(validScenarios, x => x.message, x => x.skip)
    @shouldPass
    public async validScenarios(scenario: Scenario): Promise<void>
    {
        this.setupVirtualRegistry(scenario.registry);
        this.setupVirtualDirectory(scenario.directory);

        const actual:   Manifest[] = [];
        const expected: Manifest[] = [];

        writeFileMock.call(It.any(), It.any())
            .callback
            (
                (_, data) =>
                {
                    const manifest = JSON.parse(data as string) as Manifest;

                    actual.push(manifest);
                    expected.push(scenario.expected[manifest.name] as Manifest);
                },
            );

        await chai.assert.isFulfilled(new Publisher(scenario.options).bump(...scenario.bumpArgs as Parameters<Publisher["bump"]>));

        chai.assert.deepEqual(actual, expected);
    }

    @batchTest(invalidScenarios, x => x.message, x => x.skip)
    @shouldFail
    public async invalidScenarios(scenario: Scenario): Promise<void>
    {
        this.setupVirtualRegistry(scenario.registry);
        this.setupVirtualDirectory(scenario.directory);

        await chai.assert.isRejected(new Publisher(scenario.options).bump(...scenario.bumpArgs as Parameters<Publisher["bump"]>));
    }
}
