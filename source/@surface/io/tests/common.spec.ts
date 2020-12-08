/* eslint-disable import/no-namespace */
import type { PathLike, Stats } from "fs";
import path                     from "path";
import Mock, { It }             from "@surface/mock";
import
{
    afterEach,
    beforeEach,
    shouldFail,
    shouldPass,
    suite,
    test,
} from "@surface/test-suite";
import { assert } from "chai";
import
{
    createPath,
    createPathAsync,
    isDirectory,
    isFile,
    lookup,
    lookupFile,
    lookupFileAsync,
    removePath,
    removePathAsync,
} from "../internal/common.js";
import * as externalNS from "../internal/external.js";

type ReaddirSync = (path: PathLike, options?: { encoding: BufferEncoding | null, withFileTypes?: false } | BufferEncoding | null) => string[];
type ReaddirAsync = (path: PathLike, options?: { encoding: BufferEncoding | null, withFileTypes?: false } | BufferEncoding | null) => Promise<string[]>;
type External = typeof externalNS;

const existsSyncMock    = Mock.callable<External["existsSync"]>();
const lstatAsyncMock    = Mock.callable<External["lstatAsync"]>();
const lstatSyncMock     = Mock.callable<External["lstatSync"]>();
const mkdirAsyncMock    = Mock.callable<External["mkdirAsync"]>();
const mkdirSyncMock     = Mock.callable<External["mkdirSync"]>();
const readdirAsyncMock  = Mock.callable<External["readdirAsync"]>();
const readdirSyncMock   = Mock.callable<External["readdirSync"]>();
const readlinkAsyncMock = Mock.callable<External["readlinkAsync"]>();
const readlinkSyncMock  = Mock.callable<External["readlinkSync"]>();
const rmdirAsyncMock    = Mock.callable<External["rmdirAsync"]>();
const rmdirSyncMock     = Mock.callable<External["rmdirSync"]>();
const statSyncMock      = Mock.callable<External["statSync"]>();
const unlinkAsyncMock   = Mock.callable<External["unlinkAsync"]>();
const unlinkSyncMock    = Mock.callable<External["unlinkSync"]>();

const PATH = process.cwd();

@suite
export default class IoSpec
{
    @beforeEach
    public beforeEach(): void
    {
        const external: Partial<typeof externalNS> =
        {
            existsSync:    existsSyncMock.proxy,
            lstatAsync:    lstatAsyncMock.proxy,
            lstatSync:     lstatSyncMock.proxy,
            mkdirAsync:    mkdirAsyncMock.proxy,
            mkdirSync:     mkdirSyncMock.proxy,
            readdirAsync:  readdirAsyncMock.proxy,
            readdirSync:   readdirSyncMock.proxy,
            readlinkAsync: readlinkAsyncMock.proxy,
            readlinkSync:  readlinkSyncMock.proxy,
            rmdirAsync:    rmdirAsyncMock.proxy,
            rmdirSync:     rmdirSyncMock.proxy,
            statSync:      statSyncMock.proxy,
            unlinkAsync:   unlinkAsyncMock.proxy,
            unlinkSync:    unlinkSyncMock.proxy,
        };

        Mock.module(externalNS, external);
    }

    @afterEach
    public afterEach(): void
    {
        Mock.restore(externalNS);

        existsSyncMock.clear();
        lstatAsyncMock.clear();
        lstatSyncMock.clear();
        mkdirAsyncMock.clear();
        mkdirSyncMock.clear();
        readdirAsyncMock.clear();
        readdirSyncMock.clear();
        readlinkAsyncMock.clear();
        readlinkSyncMock.clear();
        rmdirAsyncMock.clear();
        rmdirSyncMock.clear();
        statSyncMock.clear();
        unlinkAsyncMock.clear();
        unlinkSyncMock.clear();
    }

    @test @shouldPass
    public createPath(): void
    {
        const PATH_TO        = path.join(PATH, "to");
        const PATH_TO_CREATE = path.join(PATH_TO, "create");

        existsSyncMock.call(PATH).returns(true);
        existsSyncMock.call(PATH_TO).returns(false);
        existsSyncMock.call(PATH_TO_CREATE).returns(false);

        assert.doesNotThrow(() => createPath(PATH_TO_CREATE));

        existsSyncMock.call(PATH_TO_CREATE).returns(true);
        lstatSyncMock.call(PATH_TO_CREATE).returns({ isDirectory: () => true, isSymbolicLink: () => false } as Stats);

        assert.doesNotThrow(() => createPath(PATH_TO_CREATE));
    }

    @test @shouldPass
    public createPathAsync(): void
    {
        const PATH_TO        = path.join(PATH, "to");
        const PATH_TO_CREATE = path.join(PATH_TO, "create");

        existsSyncMock.call(PATH).returns(true);
        existsSyncMock.call(PATH_TO).returns(false);
        existsSyncMock.call(PATH_TO_CREATE).returns(false);

        assert.doesNotThrow(() => void createPathAsync(PATH_TO_CREATE));

        existsSyncMock.call(PATH_TO_CREATE).returns(true);
        lstatAsyncMock.call(PATH_TO_CREATE).returns(Promise.resolve({ isDirectory: () => true, isSymbolicLink: () => false } as Stats));

        assert.doesNotThrow(() => void createPathAsync(PATH_TO_CREATE));
    }

    @test @shouldPass
    public isDirectory(): void
    {
        const PATH_TO_FILE      = path.join(PATH, "to", "file");
        const PATH_TO_DIRECTORY = path.join(PATH, "to", "directory");
        const PATH_TO_ENOENT    = path.join(PATH, "to", "ENOENT");
        const PATH_TO_ENOTDIR   = path.join(PATH, "to", "ENOTDIR");

        statSyncMock.call(PATH_TO_DIRECTORY).returns({ isDirectory: () => true } as Stats);
        statSyncMock.call(PATH_TO_ENOENT).throws({ code: "ENOENT" } as unknown as Error);
        statSyncMock.call(PATH_TO_ENOTDIR).throws({ code: "ENOTDIR" } as unknown as Error);
        statSyncMock.call(It.any()).returns({ isDirectory: () => false } as Stats);

        assert.isTrue(isDirectory(PATH_TO_DIRECTORY), "isDirectory(PATH_TO_DIRECTORY) is true");
        assert.isFalse(isDirectory(PATH_TO_FILE),     "isDirectory(PATH_TO_FILE) is false");
        assert.isFalse(isDirectory(PATH_TO_ENOENT),   "isDirectory(PATH_TO_ENOENT) is false");
        assert.isFalse(isDirectory(PATH_TO_ENOTDIR),  "isDirectory(PATH_TO_ENOTDIR) is false");
    }

    @test @shouldPass
    public isFile(): void
    {
        const PATH_TO_FILE      = path.join(PATH, "to", "file");
        const PATH_TO_FIFO      = path.join(PATH, "to", "fifo");
        const PATH_TO_DIRECTORY = path.join(PATH, "to", "directory");
        const PATH_TO_ENOENT    = path.join(PATH, "to", "ENOENT");
        const PATH_TO_ENOTDIR   = path.join(PATH, "to", "ENOTDIR");

        statSyncMock.call(PATH_TO_FILE).returns({ isFIFO: () => false, isFile: () => true } as Stats);
        statSyncMock.call(PATH_TO_FIFO).returns({ isFIFO: () => true, isFile: () => false } as Stats);
        statSyncMock.call(PATH_TO_ENOENT).throws({ code: "ENOENT" } as unknown as Error);
        statSyncMock.call(PATH_TO_ENOTDIR).throws({ code: "ENOTDIR" } as unknown as Error);
        statSyncMock.call(It.any()).returns({ isFIFO: () => false, isFile: () => false } as Stats);

        assert.isTrue(isFile(PATH_TO_FILE),       "isFile(PATH_TO_FILE) is true");
        assert.isTrue(isFile(PATH_TO_FIFO),       "isFile(PATH_TO_FIFO) is true");
        assert.isFalse(isFile(PATH_TO_DIRECTORY), "isFile(PATH_TO_DIRECTORY) is false");
        assert.isFalse(isFile(PATH_TO_ENOENT),    "isFile(PATH_TO_ENOENT) is false");
        assert.isFalse(isFile(PATH_TO_ENOTDIR),   "isFile(PATH_TO_ENOTDIR) is false");
    }

    @test @shouldPass
    public removePath(): void
    {
        const PATH_TO               = path.join(PATH, "to");
        const PATH_EMPTY            = path.join(PATH, "empty");
        const PATH_TO_REMOVE        = path.join(PATH_TO, "remove");
        const PATH_TO_REMOVE_FILE   = path.join(PATH_TO_REMOVE, "file.ext");
        const PATH_TO_SYMBOLIC_LINK = path.join(PATH_TO, "Symbolic", "Link");

        existsSyncMock.call(PATH_TO_REMOVE).returns(true);
        existsSyncMock.call(PATH_TO_REMOVE_FILE).returns(true);
        existsSyncMock.call(PATH_TO_SYMBOLIC_LINK).returns(true);
        lstatSyncMock.call(PATH_TO_REMOVE).returns({ isFile: () => false, isSymbolicLink: () => false } as Stats);
        lstatSyncMock.call(PATH_TO_REMOVE_FILE).returns({ isFile: () => true, isSymbolicLink: () => false } as Stats);
        lstatSyncMock.call(PATH_TO_SYMBOLIC_LINK).returns({ isFile: () => false, isSymbolicLink: () => true } as Stats);
        readdirSyncMock.call<ReaddirSync>(PATH_TO_REMOVE).returns(["file.ext"]);

        assert.isTrue(removePath(PATH_TO_REMOVE),        "removePath(PATH_TO_REMOVE) is true");
        assert.isTrue(removePath(PATH_TO_SYMBOLIC_LINK), "removePath(PATH_TO_SYMBOLIC_LINK) is true");
        assert.isFalse(removePath(PATH_EMPTY),           "removePath(PATH_EMPTY) is false");
    }

    @test @shouldPass
    public async removePathAsync(): Promise<void>
    {
        const PATH_TO               = path.join(PATH, "to");
        const PATH_EMPTY            = path.join(PATH, "empty");
        const PATH_TO_REMOVE        = path.join(PATH_TO, "remove");
        const PATH_TO_REMOVE_FILE   = path.join(PATH_TO_REMOVE, "file.ext");
        const PATH_TO_SYMBOLIC_LINK = path.join(PATH_TO, "Symbolic", "Link");

        existsSyncMock.call(PATH_TO_REMOVE).returns(true);
        existsSyncMock.call(PATH_TO_REMOVE_FILE).returns(true);
        existsSyncMock.call(PATH_TO_SYMBOLIC_LINK).returns(true);
        lstatAsyncMock.call(PATH_TO_REMOVE).returns(Promise.resolve({ isFile: () => false, isSymbolicLink: () => false } as Stats));
        lstatAsyncMock.call(PATH_TO_REMOVE_FILE).returns(Promise.resolve({ isFile: () => true, isSymbolicLink: () => false } as Stats));
        lstatAsyncMock.call(PATH_TO_SYMBOLIC_LINK).returns(Promise.resolve({ isFile: () => false, isSymbolicLink: () => true } as Stats));
        readdirAsyncMock.call<ReaddirAsync>(PATH_TO_REMOVE).returns(Promise.resolve(["file.ext"]));

        assert.isTrue(await removePathAsync(PATH_TO_REMOVE),        "removePath(PATH_TO_REMOVE) is true");
        assert.isTrue(await removePathAsync(PATH_TO_SYMBOLIC_LINK), "removePath(PATH_TO_SYMBOLIC_LINK) is true");
        assert.isFalse(await removePathAsync(PATH_EMPTY),           "removePath(PATH_EMPTY) is false");
    }

    @test @shouldPass
    public lookupFile(): void
    {
        const expected = path.join(PATH, "resolve-3", "file.txt");

        const TO_RESOLVE_1_FILE = "./resolve-1/file.txt";
        const TO_RESOLVE_2_FILE = "./resolve-2/file.txt";
        const TO_RESOLVE_3_FILE = "./resolve-3/file.txt";

        const relativePaths =
        [
            TO_RESOLVE_1_FILE,
            TO_RESOLVE_2_FILE,
            TO_RESOLVE_3_FILE,
        ];

        const absoltePaths =
        [
            path.join(PATH, TO_RESOLVE_1_FILE),
            path.join(PATH, TO_RESOLVE_2_FILE),
            path.join(PATH, TO_RESOLVE_3_FILE),
        ];

        assert.equal(lookupFile(relativePaths), null);

        existsSyncMock.call(path.join(PATH, TO_RESOLVE_1_FILE)).returns(false);
        existsSyncMock.call(path.join(PATH, TO_RESOLVE_2_FILE)).returns(false);
        existsSyncMock.call(path.join(PATH, TO_RESOLVE_3_FILE)).returns(true);
        lstatSyncMock.call(path.join(PATH, TO_RESOLVE_1_FILE)).returns({ isFile: () => false } as Stats);
        lstatSyncMock.call(path.join(PATH, TO_RESOLVE_2_FILE)).returns({ isFile: () => false } as Stats);
        lstatSyncMock.call(path.join(PATH, TO_RESOLVE_3_FILE)).returns({ isFile: () => true } as Stats);

        assert.equal(lookupFile(relativePaths), expected);
        assert.equal(lookupFile(absoltePaths), expected);
    }

    @test @shouldPass
    public async lookupFileAsync(): Promise<void>
    {
        const expected = path.join(PATH, "resolve-3", "file.txt");

        const TO_RESOLVE_1_FILE = "./resolve-1/file.txt";
        const TO_RESOLVE_2_FILE = "./resolve-2/file.txt";
        const TO_RESOLVE_3_FILE = "./resolve-3/file.txt";

        const relativePaths =
        [
            TO_RESOLVE_1_FILE,
            TO_RESOLVE_2_FILE,
            TO_RESOLVE_3_FILE,
        ];

        const absoltePaths =
        [
            path.join(PATH, TO_RESOLVE_1_FILE),
            path.join(PATH, TO_RESOLVE_2_FILE),
            path.join(PATH, TO_RESOLVE_3_FILE),
        ];

        assert.equal(await lookupFileAsync(relativePaths), null);

        existsSyncMock.call(path.join(PATH, TO_RESOLVE_1_FILE)).returns(false);
        existsSyncMock.call(path.join(PATH, TO_RESOLVE_2_FILE)).returns(false);
        existsSyncMock.call(path.join(PATH, TO_RESOLVE_3_FILE)).returns(true);
        lstatAsyncMock.call(path.join(PATH, TO_RESOLVE_1_FILE)).returns(Promise.resolve({ isFile: () => false } as Stats));
        lstatAsyncMock.call(path.join(PATH, TO_RESOLVE_2_FILE)).returns(Promise.resolve({ isFile: () => false } as Stats));
        lstatAsyncMock.call(path.join(PATH, TO_RESOLVE_3_FILE)).returns(Promise.resolve({ isFile: () => true } as Stats));

        assert.equal(await lookupFileAsync(relativePaths), expected);
        assert.equal(await lookupFileAsync(absoltePaths), expected);
    }

    @test @shouldPass
    public lookup(): void
    {
        const PATH_TO_LOOKUP = path.join(PATH, "to", "lookup");
        const PATH_FILE      = path.join(PATH, "file.txt");
        const expected       = PATH_FILE;

        existsSyncMock.call(PATH_FILE).returns(true);

        assert.equal(lookup(PATH_TO_LOOKUP, "empty.txt"), null);
        assert.equal(lookup(PATH_TO_LOOKUP, "file.txt"), expected);
    }

    @test @shouldFail
    public createPathError(): void
    {
        const PATH_TO_CREATE = path.join(PATH, "to", "create");

        existsSyncMock.call(PATH_TO_CREATE).returns(true);
        lstatSyncMock.call(PATH_TO_CREATE).returns({ isDirectory: () => false, isSymbolicLink: () => false } as Stats);

        assert.throws(() => createPath(PATH_TO_CREATE), Error, `${PATH_TO_CREATE} exist and isn't an directory`);

        lstatSyncMock.call(PATH_TO_CREATE).returns({ isDirectory: () => false, isSymbolicLink: () => true } as Stats);
        readlinkSyncMock.call(PATH_TO_CREATE).returns(PATH_TO_CREATE);

        assert.throws(() => createPath(PATH_TO_CREATE), Error, `${PATH_TO_CREATE} exist and isn't an directory`);
    }

    @test @shouldFail
    public async createPathAsyncError(): Promise<void>
    {
        const PATH_TO_CREATE        = path.join(PATH, "to", "create");
        const PATH_TO_SIMBOLIC_LINK = path.join(PATH, "to", "simbolic", "link");

        existsSyncMock.call(PATH_TO_CREATE).returns(true);
        existsSyncMock.call(PATH_TO_SIMBOLIC_LINK).returns(true);
        lstatAsyncMock.call(PATH_TO_CREATE).returns(Promise.resolve({ isDirectory: () => false, isSymbolicLink: () => false } as Stats));
        lstatAsyncMock.call(PATH_TO_SIMBOLIC_LINK).returns(Promise.resolve({ isDirectory: () => false, isSymbolicLink: () => true } as Stats));
        readlinkAsyncMock.call(PATH_TO_SIMBOLIC_LINK).returns(Promise.resolve(PATH_TO_SIMBOLIC_LINK));

        try
        {
            await createPathAsync(PATH_TO_CREATE);
        }
        catch (error)
        {
            assert.deepEqual(`${PATH_TO_CREATE} exist and isn't an directory`, error.message);
        }

        try
        {
            await createPathAsync(PATH_TO_SIMBOLIC_LINK);
        }
        catch (error)
        {
            assert.deepEqual(`${PATH_TO_SIMBOLIC_LINK} exist and isn't an directory`, error.message);
        }
    }

    @test @shouldFail
    public isDirectoryError(): void
    {
        statSyncMock.call(It.any()).throws(new Error());

        assert.throws(() => isDirectory(PATH), Error);
    }

    @test @shouldFail
    public isFileError(): void
    {
        statSyncMock.call(It.any()).throws(new Error());

        assert.throws(() => isFile(PATH), Error);
    }
}