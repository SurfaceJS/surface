import type { Stats } from "fs";
import
{
    existsSync,
    lstatSync,
    mkdirSync,
    readdirSync,
    readlinkSync,
    rmdirSync,
    statSync,
    unlinkSync,
} from "fs";
import
{
    lstat,
    mkdir,
    readdir,
    readlink,
    rmdir,
    stat,
    unlink,
} from "fs/promises";
import path             from "path";
import { resolveError } from "@surface/core";
import Mock, { It }     from "@surface/mock";
import
{
    afterEach,
    beforeEach,
    shouldFail,
    shouldPass,
    suite,
    test,
} from "@surface/test-suite";
import chai           from "chai";
import chaiAsPromised from "chai-as-promised";
import
{
    bottomUp,
    createPath,
    createPathSync,
    isDirectory,
    isDirectorySync,
    isFile,
    isFileSync,
    listPaths,
    listPathsSync,
    lookup,
    lookupSync,
    removePath,
    removePathSync,
} from "../internal/io.js";

chai.use(chaiAsPromised);

type ReaddirSync = (path: string) => string[];
type Readdir     = (path: string) => Promise<string[]>;
type Mkdir       = (path: string, mode?: number) => Promise<void>;

const existsSyncMock   = Mock.of(existsSync)!;
const lstatMock        = Mock.of(lstat)!;
const lstatSyncMock    = Mock.of(lstatSync)!;
const mkdirMock        = Mock.of<Mkdir>(mkdir)!;
const mkdirSyncMock    = Mock.of(mkdirSync)!;
const readdirMock      = Mock.of<Readdir>(readdir)!;
const readdirSyncMock  = Mock.of<ReaddirSync>(readdirSync)!;
const readlinkMock     = Mock.of(readlink)!;
const readlinkSyncMock = Mock.of(readlinkSync)!;
const rmdirMock        = Mock.of(rmdir)!;
const rmdirSyncMock    = Mock.of(rmdirSync)!;
const statMock         = Mock.of(stat)!;
const statSyncMock     = Mock.of(statSync)!;
const unlinkMock       = Mock.of(unlink)!;
const unlinkSyncMock   = Mock.of(unlinkSync)!;

const PATH = process.cwd();

@suite
export default class IoSpec
{
    @beforeEach
    public beforeEach(): void
    {
        existsSyncMock.lock();
        lstatMock.lock();
        lstatSyncMock.lock();
        mkdirMock.lock();
        mkdirSyncMock.lock();
        readdirMock.lock();
        readdirSyncMock.lock();
        readlinkMock.lock();
        readlinkSyncMock.lock();
        rmdirMock.lock();
        rmdirSyncMock.lock();
        statMock.lock();
        statSyncMock.lock();
        unlinkMock.lock();
        unlinkSyncMock.lock();
    }

    @afterEach
    public afterEach(): void
    {
        existsSyncMock.release();
        lstatMock.release();
        lstatSyncMock.release();
        mkdirMock.release();
        mkdirSyncMock.release();
        readdirMock.release();
        readdirSyncMock.release();
        readlinkMock.release();
        readlinkSyncMock.release();
        rmdirMock.release();
        rmdirSyncMock.release();
        statMock.release();
        statSyncMock.release();
        unlinkMock.release();
        unlinkSyncMock.release();
    }

    @test @shouldPass
    public bottomUp(): void
    {
        const PATH_TO_LOOKUP = path.join(PATH, "to", "lookup");
        const PATH_FILE      = path.join(PATH, "file.txt");
        const expected       = PATH_FILE;

        existsSyncMock.call(PATH_FILE).returns(true);

        chai.assert.equal(bottomUp(PATH_TO_LOOKUP, "empty.txt"), null);
        chai.assert.equal(bottomUp(PATH_TO_LOOKUP, "file.txt"), expected);
    }

    @test @shouldPass
    public async createPath(): Promise<void>
    {
        const PATH_TO        = path.join(PATH, "to");
        const PATH_TO_CREATE = path.join(PATH_TO, "create");

        existsSyncMock.call(PATH).returns(true);
        existsSyncMock.call(PATH_TO).returns(false);
        existsSyncMock.call(PATH_TO_CREATE).returns(false);
        mkdirMock.call(It.any(), It.any()).resolve();

        await chai.assert.isFulfilled(createPath(PATH_TO_CREATE));

        existsSyncMock.call(PATH_TO_CREATE).returns(true);
        lstatMock.call(PATH_TO_CREATE).resolve({ isSymbolicLink: () => false } as Stats);
        statMock.call(PATH_TO_CREATE).resolve({ isDirectory: () => true } as Stats);

        await chai.assert.isFulfilled(createPath(PATH_TO_CREATE));
    }

    @test @shouldPass
    public createPathSync(): void
    {
        const PATH_TO        = path.join(PATH, "to");
        const PATH_TO_CREATE = path.join(PATH_TO, "create");

        existsSyncMock.call(PATH).returns(true);
        existsSyncMock.call(PATH_TO).returns(false);
        existsSyncMock.call(PATH_TO_CREATE).returns(false);
        mkdirSyncMock.call(It.any());

        chai.assert.doesNotThrow(() => createPathSync(PATH_TO_CREATE));

        existsSyncMock.call(PATH_TO_CREATE).returns(true);
        lstatSyncMock.call(PATH_TO_CREATE).returns({ isSymbolicLink: () => false } as Stats);
        statSyncMock.call(PATH_TO_CREATE).returns({ isDirectory: () => true } as Stats);

        chai.assert.doesNotThrow(() => createPathSync(PATH_TO_CREATE));
    }

    @test @shouldPass
    public async enumeratePaths(): Promise<void>
    {
        const INCLUDE             = "include";
        const EXCLUDE             = "exclude";
        const FILE_A              = "file.a";
        const FILE_B              = "file.b";
        const PATH_INCLUDE        = path.join(PATH, INCLUDE) as `~/${typeof INCLUDE}`;
        const PATH_EXCLUDE        = path.join(PATH, EXCLUDE) as `~/${typeof INCLUDE}`;
        const PATH_INCLUDE_FILE_A = path.join(PATH_INCLUDE, FILE_A) as `${typeof PATH_INCLUDE}/${typeof FILE_A}`;
        const PATH_INCLUDE_FILE_B = path.join(PATH_INCLUDE, FILE_B) as `${typeof PATH_INCLUDE}/${typeof FILE_B}`;
        const PATH_EXCLUDE_FILE_A = path.join(PATH_EXCLUDE, FILE_A) as `${typeof PATH_EXCLUDE}/${typeof FILE_A}`;
        const PATH_EXCLUDE_FILE_B = path.join(PATH_EXCLUDE, FILE_B) as `${typeof PATH_EXCLUDE}/${typeof FILE_B}`;

        readdirMock.call(PATH).resolve([INCLUDE, EXCLUDE]);
        readdirMock.call(PATH_INCLUDE).resolve([FILE_A, FILE_B]);
        readdirMock.call(PATH_EXCLUDE).resolve([FILE_A, FILE_B]);

        statMock.call(PATH_INCLUDE).resolve({ isDirectory: () => true } as Stats);
        statMock.call(PATH_EXCLUDE).resolve({ isDirectory: () => true } as Stats);

        const patterns = ["**", "!exclude/**"];

        const expected1: string[] = [PATH_INCLUDE_FILE_A, PATH_INCLUDE_FILE_B, PATH_EXCLUDE_FILE_A, PATH_EXCLUDE_FILE_B];
        const expected2: string[] = [PATH_INCLUDE_FILE_A, PATH_INCLUDE_FILE_B];

        const actual1 = await listPaths(patterns[0]!);
        const actual2 = await listPaths(/.*/);
        const actual3 = await listPaths(patterns);

        chai.assert.deepEqual(actual1, expected1, "#1");
        chai.assert.deepEqual(actual2, expected1, "#2");
        chai.assert.deepEqual(actual3, expected2, "#3");
    }

    @test @shouldPass
    public async listPathsSync(): Promise<void>
    {
        const INCLUDE             = "include";
        const EXCLUDE             = "exclude";
        const FILE_A              = "file.a";
        const FILE_B              = "file.b";
        const PATH_INCLUDE        = path.join(PATH, INCLUDE) as `~/${typeof INCLUDE}`;
        const PATH_EXCLUDE        = path.join(PATH, EXCLUDE) as `~/${typeof INCLUDE}`;
        const PATH_INCLUDE_FILE_A = path.join(PATH_INCLUDE, FILE_A) as `${typeof PATH_INCLUDE}/${typeof FILE_A}`;
        const PATH_INCLUDE_FILE_B = path.join(PATH_INCLUDE, FILE_B) as `${typeof PATH_INCLUDE}/${typeof FILE_B}`;
        const PATH_EXCLUDE_FILE_A = path.join(PATH_EXCLUDE, FILE_A) as `${typeof PATH_EXCLUDE}/${typeof FILE_A}`;
        const PATH_EXCLUDE_FILE_B = path.join(PATH_EXCLUDE, FILE_B) as `${typeof PATH_EXCLUDE}/${typeof FILE_B}`;

        readdirSyncMock.call(PATH).returns([INCLUDE, EXCLUDE]);
        readdirSyncMock.call(PATH_INCLUDE).returns([FILE_A, FILE_B]);
        readdirSyncMock.call(PATH_EXCLUDE).returns([FILE_A, FILE_B]);

        statSyncMock.call(PATH_INCLUDE).returns({ isDirectory: () => true } as Stats);
        statSyncMock.call(PATH_EXCLUDE).returns({ isDirectory: () => true } as Stats);

        const patterns = ["**", "!exclude/**"];

        const expected1: string[] = [PATH_INCLUDE_FILE_A, PATH_INCLUDE_FILE_B, PATH_EXCLUDE_FILE_A, PATH_EXCLUDE_FILE_B];
        const expected2: string[] = [PATH_INCLUDE_FILE_A, PATH_INCLUDE_FILE_B];

        const actual1 = listPathsSync(patterns[0]!);
        const actual2 = listPathsSync(/.*/);
        const actual3 = listPathsSync(patterns);

        chai.assert.deepEqual(actual1, expected1, "#1");
        chai.assert.deepEqual(actual2, expected1, "#2");
        chai.assert.deepEqual(actual3, expected2, "#3");
    }

    @test @shouldPass
    public async isDirectory(): Promise<void>
    {
        const PATH_TO_FILE      = path.join(PATH, "to", "file");
        const PATH_TO_DIRECTORY = path.join(PATH, "to", "directory");
        const PATH_TO_ENOENT    = path.join(PATH, "to", "ENOENT");
        const PATH_TO_ENOTDIR   = path.join(PATH, "to", "ENOTDIR");

        statMock.call(PATH_TO_DIRECTORY).resolve({ isDirectory: () => true } as Stats);
        statMock.call(PATH_TO_ENOENT).reject({ code: "ENOENT" } as unknown as Error);
        statMock.call(PATH_TO_ENOTDIR).reject({ code: "ENOTDIR" } as unknown as Error);
        statMock.call(It.any()).resolve({ isDirectory: () => false } as Stats);

        chai.assert.isTrue(await isDirectory(PATH_TO_DIRECTORY), "isDirectory(PATH_TO_DIRECTORY) is true");
        chai.assert.isFalse(await isDirectory(PATH_TO_FILE),     "isDirectory(PATH_TO_FILE) is false");
        chai.assert.isFalse(await isDirectory(PATH_TO_ENOENT),   "isDirectory(PATH_TO_ENOENT) is false");
        chai.assert.isFalse(await isDirectory(PATH_TO_ENOTDIR),  "isDirectory(PATH_TO_ENOTDIR) is false");
    }

    @test @shouldPass
    public isDirectorySync(): void
    {
        const PATH_TO_FILE      = path.join(PATH, "to", "file");
        const PATH_TO_DIRECTORY = path.join(PATH, "to", "directory");
        const PATH_TO_ENOENT    = path.join(PATH, "to", "ENOENT");
        const PATH_TO_ENOTDIR   = path.join(PATH, "to", "ENOTDIR");

        statSyncMock.call(PATH_TO_DIRECTORY).returns({ isDirectory: () => true } as Stats);
        statSyncMock.call(PATH_TO_ENOENT).throws({ code: "ENOENT" } as unknown as Error);
        statSyncMock.call(PATH_TO_ENOTDIR).throws({ code: "ENOTDIR" } as unknown as Error);
        statSyncMock.call(It.any()).returns({ isDirectory: () => false } as Stats);

        chai.assert.isTrue(isDirectorySync(PATH_TO_DIRECTORY), "isDirectorySync(PATH_TO_DIRECTORY) is true");
        chai.assert.isFalse(isDirectorySync(PATH_TO_FILE),     "isDirectorySync(PATH_TO_FILE) is false");
        chai.assert.isFalse(isDirectorySync(PATH_TO_ENOENT),   "isDirectorySync(PATH_TO_ENOENT) is false");
        chai.assert.isFalse(isDirectorySync(PATH_TO_ENOTDIR),  "isDirectorySync(PATH_TO_ENOTDIR) is false");
    }

    @test @shouldPass
    public async isFile(): Promise<void>
    {
        const PATH_TO_FILE      = path.join(PATH, "to", "file");
        const PATH_TO_FIFO      = path.join(PATH, "to", "fifo");
        const PATH_TO_DIRECTORY = path.join(PATH, "to", "directory");
        const PATH_TO_ENOENT    = path.join(PATH, "to", "ENOENT");
        const PATH_TO_ENOTDIR   = path.join(PATH, "to", "ENOTDIR");

        statMock.call(PATH_TO_FILE).resolve({ isFIFO: () => false, isFile: () => true } as Stats);
        statMock.call(PATH_TO_FIFO).resolve({ isFIFO: () => true, isFile: () => false } as Stats);
        statMock.call(PATH_TO_ENOENT).reject({ code: "ENOENT" } as unknown as Error);
        statMock.call(PATH_TO_ENOTDIR).reject({ code: "ENOTDIR" } as unknown as Error);
        statMock.call(It.any()).resolve({ isFIFO: () => false, isFile: () => false } as Stats);

        chai.assert.isTrue(await isFile(PATH_TO_FILE),       "isFile(PATH_TO_FILE) is true");
        chai.assert.isTrue(await isFile(PATH_TO_FIFO),       "isFile(PATH_TO_FIFO) is true");
        chai.assert.isFalse(await isFile(PATH_TO_DIRECTORY), "isFile(PATH_TO_DIRECTORY) is false");
        chai.assert.isFalse(await isFile(PATH_TO_ENOENT),    "isFile(PATH_TO_ENOENT) is false");
        chai.assert.isFalse(await isFile(PATH_TO_ENOTDIR),   "isFile(PATH_TO_ENOTDIR) is false");
    }

    @test @shouldPass
    public isFileSync(): void
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

        chai.assert.isTrue(isFileSync(PATH_TO_FILE),       "isFileSync(PATH_TO_FILE) is true");
        chai.assert.isTrue(isFileSync(PATH_TO_FIFO),       "isFileSync(PATH_TO_FIFO) is true");
        chai.assert.isFalse(isFileSync(PATH_TO_DIRECTORY), "isFileSync(PATH_TO_DIRECTORY) is false");
        chai.assert.isFalse(isFileSync(PATH_TO_ENOENT),    "isFileSync(PATH_TO_ENOENT) is false");
        chai.assert.isFalse(isFileSync(PATH_TO_ENOTDIR),   "isFileSync(PATH_TO_ENOTDIR) is false");
    }

    @test @shouldPass
    public async lookup(): Promise<void>
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

        statMock.call(It.any()).resolve({ isFIFO: () => false, isFile: () => false } as Stats);

        chai.assert.equal(await lookup(relativePaths), null);

        statMock.clear();

        statMock.call(path.join(PATH, TO_RESOLVE_1_FILE)).resolve({ isFIFO: () => false, isFile: () => false } as Stats);
        statMock.call(path.join(PATH, TO_RESOLVE_2_FILE)).resolve({ isFIFO: () => false, isFile: () => false } as Stats);
        statMock.call(path.join(PATH, TO_RESOLVE_3_FILE)).resolve({ isFIFO: () => true, isFile: () => false } as Stats);

        chai.assert.equal(await lookup(relativePaths), expected);
        chai.assert.equal(await lookup(absoltePaths), expected);
    }

    @test @shouldPass
    public lookupSync(): void
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

        statSyncMock.call(It.any()).returns({ isFIFO: () => false, isFile: () => false } as Stats);

        chai.assert.equal(lookupSync(relativePaths), null);

        statSyncMock.clear();

        statSyncMock.call(path.join(PATH, TO_RESOLVE_1_FILE)).returns({ isFIFO: () => false, isFile: () => false } as Stats);
        statSyncMock.call(path.join(PATH, TO_RESOLVE_2_FILE)).returns({ isFIFO: () => false, isFile: () => false } as Stats);
        statSyncMock.call(path.join(PATH, TO_RESOLVE_3_FILE)).returns({ isFIFO: () => true, isFile: () => false } as Stats);

        chai.assert.equal(lookupSync(relativePaths), expected);
        chai.assert.equal(lookupSync(absoltePaths), expected);
    }

    @test @shouldPass
    public async removePath(): Promise<void>
    {
        const PATH_TO               = path.join(PATH, "to");
        const PATH_EMPTY            = path.join(PATH, "empty");
        const PATH_TO_REMOVE        = path.join(PATH_TO, "remove");
        const PATH_TO_REMOVE_FILE   = path.join(PATH_TO_REMOVE, "file.ext");
        const PATH_TO_SYMBOLIC_LINK = path.join(PATH_TO, "Symbolic", "Link");

        existsSyncMock.call(PATH_TO_REMOVE).returns(true);
        existsSyncMock.call(PATH_TO_REMOVE_FILE).returns(true);
        existsSyncMock.call(PATH_TO_SYMBOLIC_LINK).returns(true);
        lstatMock.call(PATH_TO_REMOVE).resolve({ isFile: () => false, isSymbolicLink: () => false } as Stats);
        lstatMock.call(PATH_TO_REMOVE_FILE).resolve({ isFile: () => true, isSymbolicLink: () => false } as Stats);
        lstatMock.call(PATH_TO_SYMBOLIC_LINK).resolve({ isFile: () => false, isSymbolicLink: () => true } as Stats);
        readdirMock.call<Readdir>(PATH_TO_REMOVE).resolve(["file.ext"]);
        unlinkMock.call(It.any()).resolve();
        rmdirMock.call(It.any(), It.any()).resolve();

        chai.assert.isTrue(await removePath(PATH_TO_REMOVE),        "removePath(PATH_TO_REMOVE) is true");
        chai.assert.isTrue(await removePath(PATH_TO_SYMBOLIC_LINK), "removePath(PATH_TO_SYMBOLIC_LINK) is true");
        chai.assert.isFalse(await removePath(PATH_EMPTY),           "removePath(PATH_EMPTY) is false");
    }

    @test @shouldPass
    public removePathSync(): void
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
        unlinkSyncMock.call(It.any());
        rmdirSyncMock.call(It.any(), It.any());

        chai.assert.isTrue(removePathSync(PATH_TO_REMOVE),        "removePath(PATH_TO_REMOVE) is true");
        chai.assert.isTrue(removePathSync(PATH_TO_SYMBOLIC_LINK), "removePath(PATH_TO_SYMBOLIC_LINK) is true");
        chai.assert.isFalse(removePathSync(PATH_EMPTY),           "removePath(PATH_EMPTY) is false");
    }

    @test @shouldFail
    public async createPathError(): Promise<void>
    {
        const PATH_TO_CREATE        = path.join(PATH, "to", "create");
        const PATH_TO_SIMBOLIC_LINK = path.join(PATH, "to", "simbolic", "link");

        existsSyncMock.call(PATH_TO_CREATE).returns(true);
        existsSyncMock.call(PATH_TO_SIMBOLIC_LINK).returns(true);
        lstatMock.call(PATH_TO_SIMBOLIC_LINK).resolve({ isSymbolicLink: () => true } as Stats);
        statMock.call(PATH_TO_CREATE).resolve({ isDirectory: () => false } as Stats);
        readlinkMock.call(PATH_TO_SIMBOLIC_LINK).resolve(PATH_TO_SIMBOLIC_LINK);

        try
        {
            await createPath(PATH_TO_CREATE);
        }
        catch (error)
        {
            chai.assert.deepEqual(resolveError(error).message, `${PATH_TO_CREATE} exist and isn't an directory`);
        }

        try
        {
            await createPath(PATH_TO_SIMBOLIC_LINK);
        }
        catch (error)
        {
            chai.assert.deepEqual(resolveError(error).message, `${PATH_TO_SIMBOLIC_LINK} exist and isn't an directory`);
        }
    }

    @test @shouldFail
    public createPathSyncError(): void
    {
        const PATH_TO_CREATE = path.join(PATH, "to", "create");

        existsSyncMock.call(PATH_TO_CREATE).returns(true);
        statSyncMock.call(PATH_TO_CREATE).returns({ isDirectory: () => false } as Stats);
        lstatSyncMock.call(PATH_TO_CREATE).returns({ isSymbolicLink: () => false } as Stats);

        chai.assert.throws(() => createPathSync(PATH_TO_CREATE), Error, `${PATH_TO_CREATE} exist and isn't an directory`);

        lstatSyncMock.call(PATH_TO_CREATE).returns({ isDirectory: () => false, isSymbolicLink: () => true } as Stats);
        readlinkSyncMock.call(PATH_TO_CREATE).returns(PATH_TO_CREATE);

        chai.assert.throws(() => createPathSync(PATH_TO_CREATE), Error, `${PATH_TO_CREATE} exist and isn't an directory`);
    }

    @test @shouldFail
    public async isDirectoryError(): Promise<void>
    {
        statMock.call(It.any()).reject(new Error());

        await chai.assert.isRejected(isDirectory(PATH));
    }

    @test @shouldFail
    public async isFileError(): Promise<void>
    {
        statMock.call(It.any()).reject(new Error());

        await chai.assert.isRejected(isFile(PATH));
    }

    @test @shouldFail
    public isDirectorySyncError(): void
    {
        statSyncMock.call(It.any()).throws(new Error());

        chai.assert.throws(() => isDirectorySync(PATH));
    }

    @test @shouldFail
    public isFileSyncError(): void
    {
        statSyncMock.call(It.any()).throws(new Error());

        chai.assert.throws(() => isFileSync(PATH));
    }
}
