import { Stats } from "fs";
import path from "path";
import
{
    existsSync,
    lstatAsync,
    lstatSync,
    mkdirAsync,
    mkdirSync,
    readdirAsync,
    readdirSync,
    readlinkAsync,
    readlinkSync,
    rmdirAsync,
    rmdirSync,
    statSync,
    unlinkAsync,
    unlinkSync,
} from "./external";

function getStats(filepath: string): Stats | null
{
    try
    {
        return statSync(filepath);
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
    if (existsSync(targetPath))
    {
        const resolvedPath = lstatSync(targetPath).isSymbolicLink() ? readlinkSync(targetPath) : targetPath;

        if (!lstatSync(resolvedPath).isDirectory())
        {
            throw new Error(`${resolvedPath} exist and isn't an directory`);
        }

        return;
    }

    const parent = path.dirname(targetPath);

    if (!existsSync(parent))
    {
        createPath(parent, mode);

        mkdirSync(targetPath, mode);
    }

    mkdirSync(targetPath, mode);
}

/**
 * Asynchronous create a path.
 * @param path A path to create. If a URL is provided, it must use the `file:` protocol.
 * @param mode A file mode.
 */
export async function createPathAsync(path: string, mode?: number): Promise<void>;
export async function createPathAsync(targetPath: string, mode: number = 0o777): Promise<void>
{
    if (existsSync(targetPath))
    {
        const resolvedPath = (await lstatAsync(targetPath)).isSymbolicLink() ? await readlinkAsync(targetPath) : targetPath;

        if (!(await lstatAsync(resolvedPath)).isDirectory())
        {
            throw new Error(`${resolvedPath} exist and isn't an directory`);
        }

        return;
    }

    const parent = path.dirname(targetPath);

    if (!existsSync(parent))
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

        if (existsSync(filepath))
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
        if (path.isAbsolute(filepath) && existsSync(filepath) && lstatSync(filepath).isFile())
        {
            return filepath;
        }

        const resolved = path.resolve(context, filepath);

        if (existsSync(resolved) && lstatSync(resolved).isFile())
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
        if (path.isAbsolute(filepath) && existsSync(filepath) && (await lstatAsync(filepath)).isFile())
        {
            return filepath;
        }

        const resolved = path.resolve(context, filepath);

        if (existsSync(resolved) && (await lstatAsync(resolved)).isFile())
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
    if (existsSync(targetPath))
    {
        const lstat = lstatSync(targetPath);

        if (lstat.isSymbolicLink() || lstat.isFile())
        {
            unlinkSync(targetPath);
        }
        else
        {
            for (const fileOrDirectory of readdirSync(targetPath))
            {
                removePath(path.join(targetPath, fileOrDirectory));
            }

            rmdirSync(targetPath);
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
    if (existsSync(targetPath))
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