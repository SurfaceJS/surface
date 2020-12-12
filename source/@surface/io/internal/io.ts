import type { Stats } from "fs";
import fs             from "fs";
import path           from "path";
import util           from "util";

const readdirAsync  = util.promisify(fs.readdir);
const lstatAsync    = util.promisify(fs.lstat);
const readlinkAsync = util.promisify(fs.readlink);
const mkdirAsync    = util.promisify(fs.mkdir);
const rmdirAsync    = util.promisify(fs.rmdir);
const unlinkAsync   = util.promisify(fs.unlink);

function getStats(filepath: string): Stats | null
{
    try
    {
        return fs.statSync(filepath);
    }
    catch (e)
    {
        if (e && (e.code == "ENOENT" || e.code == "ENOTDIR"))
        {
            return null;
        }

        throw e;
    }
}

/**
 * Create a path.
 * @param path A path to create. If a URL is provided, it must use the `file:` protocol.
 * @param mode A file mode.
 */
export function createPath(path: string, mode?: number): void;
export function createPath(targetPath: string, mode: number = 0o777): void
{
    if (fs.existsSync(targetPath))
    {
        const resolvedPath = fs.lstatSync(targetPath).isSymbolicLink() ? fs.readlinkSync(targetPath) : targetPath;

        if (!fs.lstatSync(resolvedPath).isDirectory())
        {
            throw new Error(`${resolvedPath} exist and isn't an directory`);
        }

        return;
    }

    const parent = path.dirname(targetPath);

    if (!fs.existsSync(parent))
    {
        createPath(parent, mode);

        fs.mkdirSync(targetPath, mode);
    }

    fs.mkdirSync(targetPath, mode);
}

/**
 * Asynchronous create a path.
 * @param path A path to create. If a URL is provided, it must use the `file:` protocol.
 * @param mode A file mode.
 */
export async function createPathAsync(path: string, mode?: number): Promise<void>;
export async function createPathAsync(targetPath: string, mode: number = 0o777): Promise<void>
{
    if (fs.existsSync(targetPath))
    {
        const resolvedPath = (await lstatAsync(targetPath)).isSymbolicLink() ? await readlinkAsync(targetPath) : targetPath;

        if (!(await lstatAsync(resolvedPath)).isDirectory())
        {
            throw new Error(`${resolvedPath} exist and isn't an directory`);
        }

        return;
    }

    const parent = path.dirname(targetPath);

    if (!fs.existsSync(parent))
    {
        await createPathAsync(parent, mode);

        return mkdirAsync(targetPath, mode);
    }

    return mkdirAsync(targetPath, mode);
}

/**
 * Verifies if a path is a directory.
 * @param path Path to verify. If a URL is provided, it must use the `file:` protocol.
 */
export function isDirectory(path: string): boolean;
export function isDirectory(filePath: string): boolean
{
    const stats = getStats(filePath);

    return !!stats && stats.isDirectory();
}

/**
 * Verifies if a path is a file.
 * @param path Path to verify. If a URL is provided, it must use the `file:` protocol.
 */
export function isFile(path: string): boolean;
export function isFile(filePath: string): boolean
{
    const stats = getStats(filePath);

    return !!stats && (stats.isFile() || stats.isFIFO());
}

/**
 * Look up for target file/directory.
 * @param startPath Path to start resolution. If a URL is provided, it must use the `file:` protocol.
 * @param target    Target file/directory.
 */
export function lookup(startPath: string, target: string): string | null
{
    const slices = startPath.split(path.sep);

    while (slices.length > 0)
    {
        const filepath = path.join(slices.join(path.sep), target);

        if (fs.existsSync(filepath))
        {
            return filepath;
        }

        slices.pop();
    }

    return null;
}

/**
 * Resolve file location
 * @param lookup  Filenames to resolve.
 * @param context Context used to resolve.
 */
export function lookupFile(lookup: string[], context: string = process.cwd()): string | null
{
    for (const filepath of lookup)
    {
        if (path.isAbsolute(filepath) && fs.existsSync(filepath) && fs.lstatSync(filepath).isFile())
        {
            return filepath;
        }

        const resolved = path.resolve(context, filepath);

        if (fs.existsSync(resolved) && fs.lstatSync(resolved).isFile())
        {
            return resolved;
        }
    }

    return null;
}

/**
 * Asynchronously resolve file location
 * @param lookup  Relative or absolute path to folder or file.
 * @param context Cotext used to resolve.
 */
export async function lookupFileAsync(lookup: string[], context: string = process.cwd()): Promise<string | null>
{
    for (const filepath of lookup)
    {
        if (path.isAbsolute(filepath) && fs.existsSync(filepath) && (await lstatAsync(filepath)).isFile())
        {
            return filepath;
        }

        const resolved = path.resolve(context, filepath);

        if (fs.existsSync(resolved) && (await lstatAsync(resolved)).isFile())
        {
            return resolved;
        }
    }

    return null;
}

/**
 * Deletes recursively delete a path and unlink symbolic links
 * @param path Path to delete. If a URL is provided, it must use the `file:` protocol.
 */

export function removePath(path: string): boolean;
export function removePath(targetPath: string): boolean
{
    if (fs.existsSync(targetPath))
    {
        const lstat = fs.lstatSync(targetPath);

        if (lstat.isSymbolicLink() || lstat.isFile())
        {
            fs.unlinkSync(targetPath);
        }
        else
        {
            for (const fileOrDirectory of fs.readdirSync(targetPath))
            {
                removePath(path.join(targetPath, fileOrDirectory));
            }

            fs.rmdirSync(targetPath);
        }

        return true;
    }

    return false;
}

/**
 * Asynchronously delete a path recursively and unlink symbolic links
 * @param path Path to delete. If a URL is provided, it must use the `file:` protocol.
 */
export async function removePathAsync(path: string): Promise<boolean>;
export async function removePathAsync(targetPath: string): Promise<boolean>
{
    if (fs.existsSync(targetPath))
    {
        const lstat = await lstatAsync(targetPath);

        if (lstat.isSymbolicLink() || lstat.isFile())
        {
            await unlinkAsync(targetPath);
        }
        else
        {
            for (const fileOrDirectory of await readdirAsync(targetPath))
            {
                await removePathAsync(path.join(targetPath, fileOrDirectory));
            }

            await rmdirAsync(targetPath);
        }

        return true;
    }

    return false;
}