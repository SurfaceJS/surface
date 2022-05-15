import { existsSync }                                                            from "fs";
import { readFile, readdir, writeFile }                                          from "fs/promises";
import path                                                                      from "path";
import { isDirectory }                                                           from "@surface/io";
import Logger                                                                    from "@surface/logger";
import Mock, { It }                                                              from "@surface/mock";
import { afterEach, batchTest, beforeEach, shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import chai                                                                      from "chai";
import chaiAsPromised                                                            from "chai-as-promised";
import type { Manifest }                                                         from "pacote";
import pacote, { type ManifestResult }                                           from "pacote";
import Publisher                                                                 from "../internal/publisher.js";
import { type Scenario, type VirtualDirectory, validScenarios }                  from "./publisher.expectations.js";

chai.use(chaiAsPromised);

const existsSyncMock  = Mock.of(existsSync);
const isDirectoryMock = Mock.of(isDirectory);
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
    private readonly directoryTree = new Set<string>();

    private createFile(filepath: string, content: string): void
    {
        const parent = path.dirname(filepath);

        this.setDirectory(parent);

        isDirectoryMock.call(filepath).resolve(false);
        existsSyncMock.call(filepath).returns(true);

        const buffer = Buffer.from(content);

        readFileMock.call(filepath).resolve(buffer);
    }

    private setDirectory(filepath: string): void
    {
        if (!this.directoryTree.has(filepath))
        {
            isDirectoryMock.call(filepath).resolve(true);

            this.directoryTree.add(filepath);
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
        this.setDirectory(parent);

        const entries: string[] = [];

        for (const [key, entry] of Object.entries(directory))
        {
            const filepath = path.isAbsolute(key) ? key : path.join(parent, key);
            const dir      = path.basename(path.dirname(key));

            entries.push(dir == "." ? key : dir);

            if (typeof entry == "string")
            {
                this.createFile(filepath, entry);
            }
            else
            {
                this.setupVirtualDirectory(entry, filepath);
            }
        }

        readdirMock.call(parent).resolve(entries);
    }

    @beforeEach
    public beforeEach(): void
    {
        LoggerMock.new(It.any()).returns(loggerMock.proxy);
        LoggerMock.lock();

        existsSyncMock.lock();
        isDirectoryMock.lock();
        pacoteMock.lock();
        readdirMock.lock();
        readFileMock.lock();
        writeFileMock.lock();
    }

    @afterEach
    public afterEach(): void
    {
        LoggerMock.release();

        existsSyncMock.release();
        isDirectoryMock.release();
        pacoteMock.release();
        readdirMock.release();
        readFileMock.release();
        writeFileMock.release();
    }

    @batchTest(validScenarios, x => x.message, x => x.skip)
    @shouldPass
    public async bump(scenario: Scenario): Promise<void>
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

    @test @shouldFail
    public failingTest(): void
    {
        chai.assert.isNotOk(false);
    }
}