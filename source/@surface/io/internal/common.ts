import fs            from "fs";
import path          from "path";
import { promisify } from "util";

const lstatAsync    = promisify(fs.lstat);
const mkdirAsync    = promisify(fs.mkdir);
const readdirAsync  = promisify(fs.readdir);
const readlinkAsync = promisify(fs.readlink);
const rmdirAsync    = promisify(fs.rmdir);
const unlinkAsync   = promisify(fs.unlink);

/**
 * Create a path.
 * @param path A path to create. If a URL is provided, it must use the `file:` protocol.
 */
export function createPath(path: string): void;

/**
 * Create a path.
 * @param path A path to create. If a URL is provided, it must use the `file:` protocol.
 * @param mode A file mode.
 */
export function createPath(path: string, mode:  number): void;
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

    const parentDir = path.dirname(targetPath.toString());

    if (!fs.existsSync(parentDir))
    {
        createPath(parentDir, mode);
        return fs.mkdirSync(targetPath, mode);
    }

    return fs.mkdirSync(targetPath, mode);
}

/**
 * Asynchronously create a path.
 * @param path A path to create. If a URL is provided, it must use the `file:` protocol.
 */
export async function createPathAsync(path: string): Promise<void>;

/**
 * Asynchronous create a path.
 * @param path A path to create. If a URL is provided, it must use the `file:` protocol.
 * @param mode A file mode.
 */
export async function createPathAsync(path: string, mode: number): Promise<void>;
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

    const parentDir = path.dirname(targetPath);

    if (!fs.existsSync(parentDir))
    {
        await createPathAsync(parentDir, mode);

        return mkdirAsync(targetPath, mode);
    }

    return mkdirAsync(targetPath, mode);
}

export function isDirectory(filePath: string): boolean
{
    let stat;
    try
    {
        stat = fs.statSync(filePath);
    }
    catch (e)
    {
        if (e && (e.code == "ENOENT" || e.code == "ENOTDIR"))
        {
            return false;
        }

        throw e;
    }
    return stat.isDirectory();
}

export function isFile(filePath: string): boolean
{
    let stat;
    try
    {
        stat = fs.statSync(filePath);
    }
    catch (e)
    {
        if (e && (e.code == "ENOENT" || e.code == "ENOTDIR"))
        {
            return false;
        }

        throw e;
    }
    return stat.isFile() || stat.isFIFO();
}

/**
 * Look up for target file/directory.
 * @param startPath Path to start resolution.
 * @param target    Target file/directory.
 */
export function lookup(startPath: string, target: string): string | null
{
    const slices = startPath.split(path.sep);

    while (slices.length > 0)
    {
        const filepath = path.join(slices.join("/"), target);

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
export async function lookupFileAsync(lookup: string[], context: string = process.cwd()): Promise<string>
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

    throw new Error("paths not found");
}

/**
 * Deletes recursively delete a path and unlink symbolic links
 * @param targetPath path to delete
 */
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
 * @param targetPath path to delete
 */
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
                removePath(path.join(targetPath, fileOrDirectory));
            }

            await rmdirAsync(targetPath);
        }

        return true;
    }

    return false;
}