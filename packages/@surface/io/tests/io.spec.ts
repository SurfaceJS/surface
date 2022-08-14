import type { Stats } from "fs";
import
{
    existsSync,
    lstatSync,
    readdirSync,
    readlinkSync,
    statSync,
    unlinkSync,
} from "fs";
import
{
    lstat,
    readdir,
    readlink,
    stat,
    unlink,
} from "fs/promises";
import path         from "path";
import Mock, { It } from "@surface/mock";
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
    isDirectory,
    isDirectorySync,
    isFile,
    isFileSync,
    listPaths,
    listPathsSync,
    lookup,
    lookupSync,
    searchAbove,
} from "../internal/io.js";

chai.use(chaiAsPromised);

type ReaddirSync = (path: string) => string[];
type Readdir     = (path: string) => Promise<string[]>;

const existsSyncMock   = Mock.of(existsSync)!;
const lstatMock        = Mock.of(lstat)!;
const lstatSyncMock    = Mock.of(lstatSync)!;
const readdirMock      = Mock.of<Readdir>(readdir)!;
const readdirSyncMock  = Mock.of<ReaddirSync>(readdirSync)!;
const readlinkMock     = Mock.of(readlink)!;
const readlinkSyncMock = Mock.of(readlinkSync)!;
const statMock         = Mock.of(stat)!;
const statSyncMock     = Mock.of(statSync)!;
const unlinkMock       = Mock.of(unlink)!;
const unlinkSyncMock   = Mock.of(unlinkSync)!;

const CWD = process.cwd();

@suite
export default class IoSpec
{
    @beforeEach
    public beforeEach(): void
    {
        existsSyncMock.lock();
        lstatMock.lock();
        lstatSyncMock.lock();
        readdirMock.lock();
        readdirSyncMock.lock();
        readlinkMock.lock();
        readlinkSyncMock.lock();
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
        readdirMock.release();
        readdirSyncMock.release();
        readlinkMock.release();
        readlinkSyncMock.release();
        statMock.release();
        statSyncMock.release();
        unlinkMock.release();
        unlinkSyncMock.release();
    }

    @test @shouldPass
    public async enumeratePaths(): Promise<void>
    {
        const INCLUDE             = "include";
        const EXCLUDE             = "exclude";
        const FILE_A              = "file.a";
        const FILE_B              = "file.b";
        const PATH_INCLUDE        = path.join(CWD, INCLUDE) as `~/${typeof INCLUDE}`;
        const PATH_EXCLUDE        = path.join(CWD, EXCLUDE) as `~/${typeof INCLUDE}`;
        const PATH_INCLUDE_FILE_A = path.join(PATH_INCLUDE, FILE_A) as `${typeof PATH_INCLUDE}/${typeof FILE_A}`;
        const PATH_INCLUDE_FILE_B = path.join(PATH_INCLUDE, FILE_B) as `${typeof PATH_INCLUDE}/${typeof FILE_B}`;
        const PATH_EXCLUDE_FILE_A = path.join(PATH_EXCLUDE, FILE_A) as `${typeof PATH_EXCLUDE}/${typeof FILE_A}`;
        const PATH_EXCLUDE_FILE_B = path.join(PATH_EXCLUDE, FILE_B) as `${typeof PATH_EXCLUDE}/${typeof FILE_B}`;

        readdirMock.call(CWD).resolve([INCLUDE, EXCLUDE]);
        readdirMock.call(PATH_INCLUDE).resolve([FILE_A, FILE_B]);
        readdirMock.call(PATH_EXCLUDE).resolve([FILE_A, FILE_B]);

        statMock.call(CWD).resolve({ isDirectory: () => true, isFile: () => false, isFIFO: () => false } as Stats);
        statMock.call(PATH_INCLUDE).resolve({ isDirectory: () => true } as Stats);
        statMock.call(PATH_EXCLUDE).resolve({ isDirectory: () => true } as Stats);

        const patterns = ["**", "!exclude/**"];

        const expected1: string[] = [PATH_INCLUDE_FILE_A, PATH_INCLUDE_FILE_B, PATH_EXCLUDE_FILE_A, PATH_EXCLUDE_FILE_B];
        const expected2: string[] = [PATH_INCLUDE_FILE_A, PATH_INCLUDE_FILE_B];

        const actual1 = await listPaths(patterns[0]!);
        const actual2 = await listPaths(patterns);

        chai.assert.deepEqual(actual1, expected1, "#1");
        chai.assert.deepEqual(actual2, expected2, "#3");
    }

    @test @shouldPass
    public async enumeratePathsSync(): Promise<void>
    {
        const INCLUDE             = "include";
        const EXCLUDE             = "exclude";
        const FILE_A              = "file.a";
        const FILE_B              = "file.b";
        const PATH_INCLUDE        = path.join(CWD, INCLUDE) as `~/${typeof INCLUDE}`;
        const PATH_EXCLUDE        = path.join(CWD, EXCLUDE) as `~/${typeof INCLUDE}`;
        const PATH_INCLUDE_FILE_A = path.join(PATH_INCLUDE, FILE_A) as `${typeof PATH_INCLUDE}/${typeof FILE_A}`;
        const PATH_INCLUDE_FILE_B = path.join(PATH_INCLUDE, FILE_B) as `${typeof PATH_INCLUDE}/${typeof FILE_B}`;
        const PATH_EXCLUDE_FILE_A = path.join(PATH_EXCLUDE, FILE_A) as `${typeof PATH_EXCLUDE}/${typeof FILE_A}`;
        const PATH_EXCLUDE_FILE_B = path.join(PATH_EXCLUDE, FILE_B) as `${typeof PATH_EXCLUDE}/${typeof FILE_B}`;

        readdirSyncMock.call(CWD).returns([INCLUDE, EXCLUDE]);
        readdirSyncMock.call(PATH_INCLUDE).returns([FILE_A, FILE_B]);
        readdirSyncMock.call(PATH_EXCLUDE).returns([FILE_A, FILE_B]);

        statSyncMock.call(CWD).returns({ isDirectory: () => true, isFile: () => false, isFIFO: () => false } as Stats);
        statSyncMock.call(PATH_INCLUDE).returns({ isDirectory: () => true } as Stats);
        statSyncMock.call(PATH_EXCLUDE).returns({ isDirectory: () => true } as Stats);

        const patterns = ["**", "!exclude/**"];

        const expected1: string[] = [PATH_INCLUDE_FILE_A, PATH_INCLUDE_FILE_B, PATH_EXCLUDE_FILE_A, PATH_EXCLUDE_FILE_B];
        const expected2: string[] = [PATH_INCLUDE_FILE_A, PATH_INCLUDE_FILE_B];

        const actual1 = listPathsSync(patterns[0]!);
        const actual2 = listPathsSync(patterns);

        chai.assert.deepEqual(actual1, expected1, "#1");
        chai.assert.deepEqual(actual2, expected2, "#2");
    }

    @test @shouldPass
    public async isDirectory(): Promise<void>
    {
        const PATH_TO_FILE      = path.join(CWD, "to", "file");
        const PATH_TO_DIRECTORY = path.join(CWD, "to", "directory");
        const PATH_TO_ENOENT    = path.join(CWD, "to", "ENOENT");
        const PATH_TO_ENOTDIR   = path.join(CWD, "to", "ENOTDIR");

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
        const PATH_TO_FILE      = path.join(CWD, "to", "file");
        const PATH_TO_DIRECTORY = path.join(CWD, "to", "directory");
        const PATH_TO_ENOENT    = path.join(CWD, "to", "ENOENT");
        const PATH_TO_ENOTDIR   = path.join(CWD, "to", "ENOTDIR");

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
        const PATH_TO_FILE      = path.join(CWD, "to", "file");
        const PATH_TO_FIFO      = path.join(CWD, "to", "fifo");
        const PATH_TO_DIRECTORY = path.join(CWD, "to", "directory");
        const PATH_TO_ENOENT    = path.join(CWD, "to", "ENOENT");
        const PATH_TO_ENOTDIR   = path.join(CWD, "to", "ENOTDIR");

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
        const PATH_TO_FILE      = path.join(CWD, "to", "file");
        const PATH_TO_FIFO      = path.join(CWD, "to", "fifo");
        const PATH_TO_DIRECTORY = path.join(CWD, "to", "directory");
        const PATH_TO_ENOENT    = path.join(CWD, "to", "ENOENT");
        const PATH_TO_ENOTDIR   = path.join(CWD, "to", "ENOTDIR");

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
        const expected = path.join(CWD, "resolve-3", "file.txt");

        const TO_RESOLVE_1_FILE = "./resolve-1/file.txt";
        const TO_RESOLVE_2_FILE = "./resolve-2/file.txt";
        const TO_RESOLVE_3_FILE = "./resolve-3/file.txt";

        const relativePaths =
        [
            TO_RESOLVE_1_FILE,
            TO_RESOLVE_2_FILE,
            TO_RESOLVE_3_FILE,
        ];

        const absolutePaths =
        [
            path.join(CWD, TO_RESOLVE_1_FILE),
            path.join(CWD, TO_RESOLVE_2_FILE),
            path.join(CWD, TO_RESOLVE_3_FILE),
        ];

        statMock.call(It.any()).resolve({ isFIFO: () => false, isFile: () => false } as Stats);

        chai.assert.equal(await lookup(relativePaths), null);

        statMock.clear();

        statMock.call(path.join(CWD, TO_RESOLVE_1_FILE)).resolve({ isFIFO: () => false, isFile: () => false } as Stats);
        statMock.call(path.join(CWD, TO_RESOLVE_2_FILE)).resolve({ isFIFO: () => false, isFile: () => false } as Stats);
        statMock.call(path.join(CWD, TO_RESOLVE_3_FILE)).resolve({ isFIFO: () => true, isFile: () => false } as Stats);

        chai.assert.equal(await lookup(relativePaths), expected);
        chai.assert.equal(await lookup(absolutePaths), expected);
    }

    @test @shouldPass
    public lookupSync(): void
    {
        const expected = path.join(CWD, "resolve-3", "file.txt");

        const TO_RESOLVE_1_FILE = "./resolve-1/file.txt";
        const TO_RESOLVE_2_FILE = "./resolve-2/file.txt";
        const TO_RESOLVE_3_FILE = "./resolve-3/file.txt";

        const relativePaths =
        [
            TO_RESOLVE_1_FILE,
            TO_RESOLVE_2_FILE,
            TO_RESOLVE_3_FILE,
        ];

        const absolutePaths =
        [
            path.join(CWD, TO_RESOLVE_1_FILE),
            path.join(CWD, TO_RESOLVE_2_FILE),
            path.join(CWD, TO_RESOLVE_3_FILE),
        ];

        statSyncMock.call(It.any()).returns({ isFIFO: () => false, isFile: () => false } as Stats);

        chai.assert.equal(lookupSync(relativePaths), null);

        statSyncMock.clear();

        statSyncMock.call(path.join(CWD, TO_RESOLVE_1_FILE)).returns({ isFIFO: () => false, isFile: () => false } as Stats);
        statSyncMock.call(path.join(CWD, TO_RESOLVE_2_FILE)).returns({ isFIFO: () => false, isFile: () => false } as Stats);
        statSyncMock.call(path.join(CWD, TO_RESOLVE_3_FILE)).returns({ isFIFO: () => true, isFile: () => false } as Stats);

        chai.assert.equal(lookupSync(relativePaths), expected);
        chai.assert.equal(lookupSync(absolutePaths), expected);
    }

    @test @shouldPass
    public searchAbove(): void
    {
        const PATH_TO_LOOKUP = path.join(CWD, "to", "lookup");
        const PATH_FILE      = path.join(CWD, "file.txt");
        const expected       = PATH_FILE;

        existsSyncMock.call(PATH_FILE).returns(true);

        chai.assert.equal(searchAbove(PATH_TO_LOOKUP, "empty.txt"), null);
        chai.assert.equal(searchAbove(PATH_TO_LOOKUP, "file.txt"), expected);
    }

    @test @shouldFail
    public async isDirectoryError(): Promise<void>
    {
        statMock.call(It.any()).reject(new Error());

        await chai.assert.isRejected(isDirectory(CWD));
    }

    @test @shouldFail
    public async isFileError(): Promise<void>
    {
        statMock.call(It.any()).reject(new Error());

        await chai.assert.isRejected(isFile(CWD));
    }

    @test @shouldFail
    public isDirectorySyncError(): void
    {
        statSyncMock.call(It.any()).throws(new Error());

        chai.assert.throws(() => isDirectorySync(CWD));
    }

    @test @shouldFail
    public isFileSyncError(): void
    {
        statSyncMock.call(It.any()).throws(new Error());

        chai.assert.throws(() => isFileSync(CWD));
    }
}
