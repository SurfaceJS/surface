import { type Stats, existsSync }                                                    from "fs";
import { readFile, readdir, stat, writeFile }                                        from "fs/promises";
import path, { relative, resolve }                                                   from "path";
import type { PackageJson as _PackageJson }                                          from "@npm/types";
import Logger                                                                        from "@surface/logger";
import Mock, { It }                                                                  from "@surface/mock";
import { execute }                                                                   from "@surface/rwx";
import { afterEach, batchTest, beforeEach, shouldFail, shouldPass, suite, test }     from "@surface/test-suite";
import { assert, use }                                                               from "chai";
import chaiAsPromised                                                                from "chai-as-promised";
import pack                                                                          from "libnpmpack";
import { changelog, getEnv, recommendedBump, timestamp }                             from "../internal/common.js";
import { addTag, commit, commitAll, getRemoteUrl, isWorkingTreeClean, pushToRemote } from "../internal/git.js";
import NpmService                                                                    from "../internal/npm-service.js";
import Publisher                                                                     from "../internal/publisher.js";
import ReleaseClient                                                                 from "../internal/release-client.js";
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

use(chaiAsPromised);

const addTagMock             = Mock.of(addTag);
const changelogMock          = Mock.of(changelog);
const commitAllMock          = Mock.of(commitAll);
const commitMock             = Mock.of(commit);
const getEnvMock             = Mock.of(getEnv);
const executeMock            = Mock.of(execute);
const existsSyncMock         = Mock.of(existsSync);
const getRemoteUrlMock       = Mock.of(getRemoteUrl);
const isWorkingTreeCleanMock = Mock.of(isWorkingTreeClean);
const loggerMock             = Mock.instance<Logger>();
const LoggerMock             = Mock.of(Logger);
const npmServiceMock         = Mock.instance<NpmService>();
const NpmServiceMock         = Mock.of(NpmService);
const packMock               = Mock.of(pack);
const pushToRemoteMock       = Mock.of(pushToRemote);
const readdirMock            = Mock.of(readdir);
const readFileMock           = Mock.of(readFile);
const recommendedBumpMock    = Mock.of(recommendedBump);
const releaseClientMock      = Mock.instance<ReleaseClient>();
const ReleaseClientMock      = Mock.of(ReleaseClient);
const statMock               = Mock.of(stat);
const timestampMock          = Mock.of(timestamp);
const writeFileMock          = Mock.of(writeFile);

executeMock.call(It.any(), It.any()).resolve(Buffer.from([]));

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

    private setup(scenario: { registry: VirtualRegistry, directory: VirtualDirectory, env?: NodeJS.ProcessEnv }): void
    {
        this.setupVirtualEnv(scenario.env);
        this.setupVirtualDirectory(scenario.directory);
        this.setupVirtualRegistry(scenario.registry);
    }

    private setupVirtualEnv(env?: NodeJS.ProcessEnv): void
    {
        getEnvMock.call().returns(env ?? { });
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
        npmServiceMock
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

        npmServiceMock
            .setup("isPublished")
            .call(It.any())
            .returnsFactory(async x => Promise.resolve(registry[x.name]?.isPublished ?? false));

        npmServiceMock
            .setup("hasChanges")
            .call(It.any(), It.any(), It.any())
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
        addTagMock.call(It.any(), It.any()).resolve();
        changelogMock.call(It.any(), It.any()).resolve(Buffer.from([]));
        commitAllMock.call(It.any()).resolve();
        getRemoteUrlMock.call(It.any()).resolve("https://host/owner/project");
        isWorkingTreeCleanMock.call().resolve(true);
        LoggerMock.new(It.any()).returns(loggerMock.proxy);
        NpmServiceMock.new(It.any()).returns(npmServiceMock.proxy);
        packMock.call(It.any()).resolve(Buffer.from([]));
        pushToRemoteMock.call(It.any()).resolve();
        ReleaseClientMock.new(It.any(), It.any()).returns(releaseClientMock.proxy);
        timestampMock.call().returns("202201010000");
        releaseClientMock.setup("createRelease").call(It.any(), It.any()).resolve();

        LoggerMock.lock();
        NpmServiceMock.lock();
        ReleaseClientMock.lock();

        addTagMock.lock();
        changelogMock.lock();
        commitAllMock.lock();
        commitMock.lock();
        getEnvMock.lock();
        existsSyncMock.lock();
        getRemoteUrlMock.lock();
        isWorkingTreeCleanMock.lock();
        packMock.lock();
        pushToRemoteMock.lock();
        readdirMock.lock();
        readFileMock.lock();
        recommendedBumpMock.lock();
        releaseClientMock.lock();
        statMock.lock();
        timestampMock.lock();
        writeFileMock.lock();
    }

    @afterEach
    public afterEach(): void
    {
        this.directoryTree.clear();

        LoggerMock.release();
        NpmServiceMock.release();
        ReleaseClientMock.unlock();

        addTagMock.release();
        changelogMock.release();
        commitAllMock.release();
        commitMock.release();
        getEnvMock.release();
        existsSyncMock.release();
        getRemoteUrlMock.release();
        isWorkingTreeCleanMock.release();
        packMock.release();
        pushToRemoteMock.release();
        readdirMock.release();
        readFileMock.release();
        recommendedBumpMock.release();
        releaseClientMock.unlock();
        statMock.release();
        timestampMock.release();
        writeFileMock.release();
    }

    @batchTest(validBumpScenarios, x => `[bump]: ${x.message}`, x => x.skip)
    @shouldPass
    public async validBumpScenarios(scenario: BumpScenario): Promise<void>
    {
        this.setup(scenario);

        if (scenario.recommended)
        {
            for (const [key, value] of Object.entries(scenario.recommended))
            {
                recommendedBumpMock.call(It.any(), key).resolve({ releaseType: value });
            }
        }

        const actual: Required<BumpScenario["expected"]> = { bumps: { }, changelogs: [], tags: [] };

        writeFileMock.call(It.any(), It.any())
            .callback
            (
                (filename, data) =>
                {
                    assert(typeof filename == "string");

                    if (filename.endsWith("package.json"))
                    {
                        const manifest = JSON.parse(data as string) as PackageJson;

                        actual.bumps[manifest.name] = manifest;
                    }
                    else if (filename.endsWith("CHANGELOG.md"))
                    {
                        actual.changelogs.push(relative(process.cwd(), resolve(filename, "..")) || ".");
                    }
                },
            );

        addTagMock.call(It.any(), It.any())
            .callback((tag, _) => actual.tags.push(tag));

        await assert.isFulfilled(new Publisher(scenario.options).bump(...scenario.args));

        assert.deepEqual(actual, scenario.expected);
    }

    @batchTest(validChangedScenarios, x => `[changed]: ${x.message}`, x => x.skip)
    @shouldPass
    public async validChangedScenarios(scenario: ChangedScenario): Promise<void>
    {
        this.setup(scenario);

        const actual = await new Publisher(scenario.options).changed(...scenario.args);

        assert.deepEqual(actual, scenario.expected);
    }

    @batchTest(validPublishScenarios, x => `[publish]: ${x.message}`, x => x.skip)
    @shouldPass
    public async validPublishScenarios(scenario: PublishScenario): Promise<void>
    {
        this.setup(scenario);

        const actual: string[] = [];

        writeFileMock.call(It.any(), It.any()).resolve();

        npmServiceMock.setup("publish").call(It.any(), It.any(), It.any())
            .callback(x => actual.push(`${x.name}@${x.version}`))
            .resolve();

        await assert.isFulfilled(new Publisher(scenario.options).publish(...scenario.args));

        assert.deepEqual(actual, scenario.expected.published);
    }

    @batchTest(validUnpublishScenarios, x => `[unpublish]: ${x.message}`, x => x.skip)
    @shouldPass
    public async validUnpublishScenarios(scenario: UnpublishScenario): Promise<void>
    {
        this.setup(scenario);

        const actual: string[] = [];

        npmServiceMock.setup("unpublish").call(It.any())
            .callback(x => actual.push(x))
            .resolve();

        await assert.isFulfilled(new Publisher(scenario.options).unpublish());

        assert.deepEqual(actual, scenario.expected.unpublished);
    }

    @batchTest(invalidBumpScenarios, x => `[bump]: ${x.message}`, x => x.skip)
    @shouldFail
    public async invalidBumpScenarios(scenario: BumpScenario): Promise<void>
    {
        this.setup(scenario);

        writeFileMock.call(It.any(), It.any()).resolve();

        await assert.isRejected(new Publisher(scenario.options).bump(...scenario.args));
    }

    @test("[bump]: Try commit dirty working tree")
    @shouldFail
    public async bumpTryCommitDirtyWorkingTree(): Promise<void>
    {
        const directory: VirtualDirectory =
        {
            "./package.json": JSON.stringify({ name: "foo", version: "1.0.0" } as PackageJson),
        };

        isWorkingTreeCleanMock.call().resolve(false);

        this.setup({ directory, registry: { } });

        await assert.isRejected(new Publisher({ }).bump("major", undefined, undefined, { commit: true }));
    }

    @test("[publish]: Publishing should fail")
    @shouldFail
    public async publishingShouldFail(): Promise<void>
    {
        const directory: VirtualDirectory =
        {
            "./packages/package-a/package.json": JSON.stringify({ name: "foo", version: "1.0.0" } as PackageJson),
        };

        this.setup({ directory, registry: { } });

        npmServiceMock.setup("publish").call(It.any(), It.any(), It.any()).reject();

        writeFileMock.call(It.any(), It.any()).resolve();

        await assert.isRejected(new Publisher({ packages: ["packages/*"] }).publish());
    }

    @test("[unpublish]: Unpublishing should fail")
    @shouldFail
    public async unpublishingShouldFail(): Promise<void>
    {
        const directory: VirtualDirectory =
        {
            "./packages/package-a/package.json": "{ \"name\": \"package-a\" }",
        };

        this.setup({ directory, registry: { "package-a": { isPublished: true, hasChanges: true } } });

        npmServiceMock.setup("unpublish").call(It.any()).reject();

        await assert.isRejected(new Publisher({ packages: ["packages/*"] }).unpublish());
    }
}
