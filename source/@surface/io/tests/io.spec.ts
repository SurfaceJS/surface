/* eslint-disable @typescript-eslint/no-extra-parens */
/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import fs from "fs?require=proxy";

import type { PathLike, Stats } from "fs";
import path                     from "path";
import Mock, { It }             from "@surface/mock";
import
{
    afterEach,
    shouldFail,
    shouldPass,
    suite,
    test,
} from "@surface/test-suite";
import chai from "chai";
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
} from "../internal/io.js";

type Readdir     = (path: PathLike, callback: (err: NodeJS.ErrnoException | null, files: string[]) => void) => void;
type ReaddirSync = (path: PathLike) => string[];
type Rmdir       = (path: PathLike, callback: (err: NodeJS.ErrnoException | null) => void) => void;

const existsSyncMock   = Mock.of<typeof import("fs").existsSync>(fs.existsSync)!;
const lstatMock        = Mock.of<typeof import("fs").lstat>(fs.lstat)!;
const lstatSyncMock    = Mock.of<typeof import("fs").lstatSync>(fs.lstatSync)!;
const mkdirMock        = Mock.of<typeof import("fs").mkdir>(fs.mkdir)!;
const mkdirSyncMock    = Mock.of<typeof import("fs").mkdirSync>(fs.mkdirSync)!;
const readdirMock      = Mock.of<Readdir>(fs.readdir)!;
const readdirSyncMock  = Mock.of<ReaddirSync>(fs.readdirSync)!;
const readlinkMock     = Mock.of<typeof import("fs").readlink>(fs.readlink)!;
const readlinkSyncMock = Mock.of<typeof import("fs").readlinkSync>(fs.readlinkSync)!;
const rmdirMock        = Mock.of<Rmdir>(fs.rmdir)!;
const rmdirSyncMock    = Mock.of<typeof import("fs").rmdirSync>(fs.rmdirSync)!;
const statSyncMock     = Mock.of<typeof import("fs").statSync>(fs.statSync)!;
const unlinkMock       = Mock.of<typeof import("fs").unlink>(fs.unlink)!;
const unlinkSyncMock   = Mock.of<typeof import("fs").unlinkSync>(fs.unlinkSync)!;

const PATH = process.cwd();

@suite
export default class IoSpec
{
    @afterEach
    public afterEach(): void
    {
        existsSyncMock.clear();
        lstatMock.clear();
        lstatSyncMock.clear();
        mkdirMock.clear();
        mkdirSyncMock.clear();
        readdirMock.clear();
        readdirSyncMock.clear();
        readlinkMock.clear();
        readlinkSyncMock.clear();
        rmdirMock.clear();
        rmdirSyncMock.clear();
        statSyncMock.clear();
        unlinkMock.clear();
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
        mkdirSyncMock.call(It.any());

        chai.assert.doesNotThrow(() => createPath(PATH_TO_CREATE));

        existsSyncMock.call(PATH_TO_CREATE).returns(true);
        lstatSyncMock.call(PATH_TO_CREATE).returns({ isDirectory: () => true, isSymbolicLink: () => false } as Stats);

        chai.assert.doesNotThrow(() => createPath(PATH_TO_CREATE));
    }

    @test @shouldPass
    public createPathAsync(): void
    {
        const PATH_TO        = path.join(PATH, "to");
        const PATH_TO_CREATE = path.join(PATH_TO, "create");

        existsSyncMock.call(PATH).returns(true);
        existsSyncMock.call(PATH_TO).returns(false);
        existsSyncMock.call(PATH_TO_CREATE).returns(false);
        mkdirSyncMock.call(It.any());

        chai.assert.doesNotThrow(() => void createPathAsync(PATH_TO_CREATE));

        existsSyncMock.call(PATH_TO_CREATE).returns(true);
        lstatMock.call(PATH_TO_CREATE, It.any()).callback((_1, callback) => callback(null, { isDirectory: () => true, isSymbolicLink: () => false } as Stats));

        chai.assert.doesNotThrow(() => void createPathAsync(PATH_TO_CREATE));
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

        chai.assert.isTrue(isDirectory(PATH_TO_DIRECTORY), "isDirectory(PATH_TO_DIRECTORY) is true");
        chai.assert.isFalse(isDirectory(PATH_TO_FILE),     "isDirectory(PATH_TO_FILE) is false");
        chai.assert.isFalse(isDirectory(PATH_TO_ENOENT),   "isDirectory(PATH_TO_ENOENT) is false");
        chai.assert.isFalse(isDirectory(PATH_TO_ENOTDIR),  "isDirectory(PATH_TO_ENOTDIR) is false");
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

        chai.assert.isTrue(isFile(PATH_TO_FILE),       "isFile(PATH_TO_FILE) is true");
        chai.assert.isTrue(isFile(PATH_TO_FIFO),       "isFile(PATH_TO_FIFO) is true");
        chai.assert.isFalse(isFile(PATH_TO_DIRECTORY), "isFile(PATH_TO_DIRECTORY) is false");
        chai.assert.isFalse(isFile(PATH_TO_ENOENT),    "isFile(PATH_TO_ENOENT) is false");
        chai.assert.isFalse(isFile(PATH_TO_ENOTDIR),   "isFile(PATH_TO_ENOTDIR) is false");
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
        rmdirSyncMock.call(It.any(), It.any());
        unlinkSyncMock.call(It.any());

        chai.assert.isTrue(removePath(PATH_TO_REMOVE),        "removePath(PATH_TO_REMOVE) is true");
        chai.assert.isTrue(removePath(PATH_TO_SYMBOLIC_LINK), "removePath(PATH_TO_SYMBOLIC_LINK) is true");
        chai.assert.isFalse(removePath(PATH_EMPTY),           "removePath(PATH_EMPTY) is false");
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
        lstatMock.call(PATH_TO_REMOVE, It.any()).callback((_a, callback) => callback(null, { isFile: () => false, isSymbolicLink: () => false } as Stats));
        lstatMock.call(PATH_TO_REMOVE_FILE, It.any()).callback((_a, callback) => callback(null, { isFile: () => true, isSymbolicLink: () => false } as Stats));
        lstatMock.call(PATH_TO_SYMBOLIC_LINK, It.any()).callback((_a, callback) => callback(null, { isFile: () => false, isSymbolicLink: () => true } as Stats));
        readdirMock.call(PATH_TO_REMOVE, It.any()).callback((_a, callback) => callback(null, ["file.ext"]));
        rmdirMock.call(It.any(), It.any()).callback((_a, callback) => callback(null));
        unlinkMock.call(It.any(), It.any()).callback((_a, callback) => callback(null));

        chai.assert.isTrue(await removePathAsync(PATH_TO_REMOVE),        "removePath(PATH_TO_REMOVE) is true");
        chai.assert.isTrue(await removePathAsync(PATH_TO_SYMBOLIC_LINK), "removePath(PATH_TO_SYMBOLIC_LINK) is true");
        chai.assert.isFalse(await removePathAsync(PATH_EMPTY),           "removePath(PATH_EMPTY) is false");
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

        chai.assert.equal(lookupFile(relativePaths), null);

        existsSyncMock.call(path.join(PATH, TO_RESOLVE_1_FILE)).returns(false);
        existsSyncMock.call(path.join(PATH, TO_RESOLVE_2_FILE)).returns(false);
        existsSyncMock.call(path.join(PATH, TO_RESOLVE_3_FILE)).returns(true);
        lstatSyncMock.call(path.join(PATH, TO_RESOLVE_1_FILE)).returns({ isFile: () => false } as Stats);
        lstatSyncMock.call(path.join(PATH, TO_RESOLVE_2_FILE)).returns({ isFile: () => false } as Stats);
        lstatSyncMock.call(path.join(PATH, TO_RESOLVE_3_FILE)).returns({ isFile: () => true } as Stats);

        chai.assert.equal(lookupFile(relativePaths), expected);
        chai.assert.equal(lookupFile(absoltePaths), expected);
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

        chai.assert.equal(await lookupFileAsync(relativePaths), null);

        existsSyncMock.call(path.join(PATH, TO_RESOLVE_1_FILE)).returns(false);
        existsSyncMock.call(path.join(PATH, TO_RESOLVE_2_FILE)).returns(false);
        existsSyncMock.call(path.join(PATH, TO_RESOLVE_3_FILE)).returns(true);
        lstatMock.call(path.join(PATH, TO_RESOLVE_1_FILE), It.any()).callback((_1, callback) => callback(null, { isFile: () => false } as Stats));
        lstatMock.call(path.join(PATH, TO_RESOLVE_2_FILE), It.any()).callback((_1, callback) => callback(null, { isFile: () => false } as Stats));
        lstatMock.call(path.join(PATH, TO_RESOLVE_3_FILE), It.any()).callback((_1, callback) => callback(null, { isFile: () => true } as Stats));

        chai.assert.equal(await lookupFileAsync(relativePaths), expected);
        chai.assert.equal(await lookupFileAsync(absoltePaths), expected);
    }

    @test @shouldPass
    public lookup(): void
    {
        const PATH_TO_LOOKUP = path.join(PATH, "to", "lookup");
        const PATH_FILE      = path.join(PATH, "file.txt");
        const expected       = PATH_FILE;

        existsSyncMock.call(PATH_FILE).returns(true);

        chai.assert.equal(lookup(PATH_TO_LOOKUP, "empty.txt"), null);
        chai.assert.equal(lookup(PATH_TO_LOOKUP, "file.txt"), expected);
    }

    @test @shouldFail
    public createPathError(): void
    {
        const PATH_TO_CREATE = path.join(PATH, "to", "create");

        existsSyncMock.call(PATH_TO_CREATE).returns(true);
        lstatSyncMock.call(PATH_TO_CREATE).returns({ isDirectory: () => false, isSymbolicLink: () => false } as Stats);

        chai.assert.throws(() => createPath(PATH_TO_CREATE), Error, `${PATH_TO_CREATE} exist and isn't an directory`);

        lstatSyncMock.call(PATH_TO_CREATE).returns({ isDirectory: () => false, isSymbolicLink: () => true } as Stats);
        readlinkSyncMock.call(PATH_TO_CREATE).returns(PATH_TO_CREATE);

        chai.assert.throws(() => createPath(PATH_TO_CREATE), Error, `${PATH_TO_CREATE} exist and isn't an directory`);
    }

    @test @shouldFail
    public async createPathAsyncError(): Promise<void>
    {
        const PATH_TO_CREATE        = path.join(PATH, "to", "create");
        const PATH_TO_SIMBOLIC_LINK = path.join(PATH, "to", "simbolic", "link");

        existsSyncMock.call(PATH_TO_CREATE).returns(true);
        existsSyncMock.call(PATH_TO_SIMBOLIC_LINK).returns(true);
        lstatMock.call(PATH_TO_CREATE, It.any()).callback((_1, callback) => callback(null, { isDirectory: () => false, isSymbolicLink: () => false } as Stats));
        lstatMock.call(PATH_TO_SIMBOLIC_LINK, It.any()).callback((_1, callback) => callback(null, { isDirectory: () => false, isSymbolicLink: () => true } as Stats));
        readlinkMock.call(PATH_TO_SIMBOLIC_LINK, It.any()).callback((_1, callback) => callback(null, PATH_TO_SIMBOLIC_LINK));

        try
        {
            await createPathAsync(PATH_TO_CREATE);
        }
        catch (error)
        {
            chai.assert.deepEqual(`${PATH_TO_CREATE} exist and isn't an directory`, error.message);
        }

        try
        {
            await createPathAsync(PATH_TO_SIMBOLIC_LINK);
        }
        catch (error)
        {
            chai.assert.deepEqual(`${PATH_TO_SIMBOLIC_LINK} exist and isn't an directory`, error.message);
        }
    }

    @test @shouldFail
    public isDirectoryError(): void
    {
        statSyncMock.call(It.any()).throws(new Error());

        chai.assert.throws(() => isDirectory(PATH), Error);
    }

    @test @shouldFail
    public isFileError(): void
    {
        statSyncMock.call(It.any()).throws(new Error());

        chai.assert.throws(() => isFile(PATH), Error);
    }
}