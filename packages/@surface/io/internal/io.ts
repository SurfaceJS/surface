import { existsSync, lstatSync, mkdirSync, readdirSync, readlinkSync, rmdirSync, statSync, unlinkSync } from "fs";
import { lstat, mkdir, readdir, readlink, rmdir, stat, unlink }                                         from "fs/promises";
import { dirname, isAbsolute, join, resolve }                                                           from "path";
import type { Callable }                                                                                from "@surface/core";
import parsePatternPath                                                                                 from "./parse-pattern-path.js";

type ErrorCode = Error & { code: string };

function errorHandler(error: ErrorCode): null
{
    if (error.code == "ENOENT" || error.code == "ENOTDIR")
    {
        return null;
    }

    throw error;
}

function handler<T extends Callable>(action: Callable): ReturnType<T> | null
{
    try
    {
        const result = action();

        return result instanceof Promise ? result.catch(errorHandler) : result;
    }
    catch (error)
    {
        return errorHandler(error as ErrorCode);
    }
}

/**
 * Looks from bottom to up for the target file/directory.
 * @param startPath Path to start resolution. If a URL is provided, it must use the `file:` protocol.
 * @param target Target file/directory.
 */
export function bottomUp(startPath: string, target: string): string | null
{
    const path = join(startPath, target);

    if (existsSync(path))
    {
        return path;
    }

    const parent = dirname(startPath);

    if (parent != startPath)
    {
        return bottomUp(parent, target);
    }

    return null;
}

/**
 * Asynchronous create a path.
 * @param path A path to create. If a URL is provided, it must use the `file:` protocol.
 * @param mode A file mode.
 */
export async function createPath(path: string, mode: number = 0o777): Promise<void>
{
    if (existsSync(path))
    {
        const resolvedPath = await isSymbolicLink(path) ? await readlink(path) : path;

        if (!await isDirectory(path))
        {
            throw new Error(`${resolvedPath} exist and isn't an directory`);
        }

        return;
    }

    const parent = dirname(path);

    if (!existsSync(parent))
    {
        await createPath(parent, mode);
    }

    return mkdir(path, mode);
}

/**
 * Create a path.
 * @param path A path to create. If a URL is provided, it must use the `file:` protocol.
 * @param mode A file mode.
 */
export function createPathSync(path: string, mode?: number): void
{
    if (existsSync(path))
    {
        const resolvedPath = isSymbolicLinkSync(path) ? readlinkSync(path) : path;

        if (!isDirectorySync(resolvedPath))
        {
            throw new Error(`${resolvedPath} exist and isn't an directory`);
        }

        return;
    }

    const parent = dirname(path);

    if (!existsSync(parent))
    {
        createPathSync(parent, mode);

        mkdirSync(path, mode);
    }

    mkdirSync(path, mode);
}

/**
 * Creates a regex that test the provided patterns.
 * @param patterns Patterns to test.
 */
export function createPathMatcher(...patterns: string[]): RegExp
{
    return new RegExp(patterns.map(x => `(${parsePatternPath(x).source})`).join("|"));
}

/**
 * Asynchronous Verifies if a path is a directory.
 * @param path Path to verify. If a URL is provided, it must use the `file:` protocol.
 */
export async function isDirectory(path: string): Promise<boolean>
{
    const stats = await handler(async () => stat(path));

    return !!stats && stats.isDirectory();
}

/**
 * Verifies if a path is a directory.
 * @param path Path to verify. If a URL is provided, it must use the `file:` protocol.
 */
export function isDirectorySync(path: string): boolean
{
    const stats = handler(() => statSync(path));

    return !!stats && stats.isDirectory();
}

/**
 * Verifies if a path is a file.
 * @param path Path to verify. If a URL is provided, it must use the `file:` protocol.
 */
export async function isFile(path: string): Promise<boolean>
{
    const stats = await handler(async () => stat(path));

    return !!stats && (stats.isFile() || stats.isFIFO());
}

/**
 * Verifies if a path is a file.
 * @param path Path to verify. If a URL is provided, it must use the `file:` protocol.
 */
export function isFileSync(path: string): boolean
{
    const stats = handler(() => statSync(path));

    return !!stats && (stats.isFile() || stats.isFIFO());
}

/**
 * Verifies if a path is a symbolic link.
 * @param path Path to verify. If a URL is provided, it must use the `file:` protocol.
 */
export async function isSymbolicLink(path: string): Promise<boolean>
{
    const stats = await handler(async () => lstat(path));

    return !!stats && stats.isSymbolicLink();
}

/**
 * Verifies if a path is a symbolic link.
 * @param path Path to verify. If a URL is provided, it must use the `file:` protocol.
 */
export function isSymbolicLinkSync(path: string): boolean
{
    const stats = handler(() => lstatSync(path));

    return !!stats && stats.isSymbolicLink();
}

/**
 * Asynchronous resolve and returns the path of the first resolved file and null otherwise.
 * @param files  Files to look.
 * @param context Context used to resolve.
 */
export async function lookup(files: string[], context: string = process.cwd()): Promise<string | null>
{
    for (const path of files)
    {
        const resolved = isAbsolute(path) ? path : resolve(context, path);

        if (await isFile(resolved))
        {
            return resolved;
        }
    }

    return null;
}

/**
 * Resolve and returns the path of the first resolved file and null otherwise.
 * @param files  Files to look.
 * @param context Context used to resolve.
 */
export function lookupSync(files: string[], context: string = process.cwd()): string | null
{
    for (const path of files)
    {
        const resolved = isAbsolute(path) ? path : resolve(context, path);

        if (isFileSync(resolved))
        {
            return resolved;
        }
    }

    return null;
}

/**
 * Returns true if the path matches one of the provided patterns.
 * @param path Path to test.
 * @param patterns Patterns to which the path must match.
 */
export function matchPath(path: string, ...patterns: [string, ...string[]]): boolean
{
    return createPathMatcher(...patterns).test(path);
}

/**
 * Deletes recursively delete a path and unlink symbolic links
 * @param path Path to delete. If a URL is provided, it must use the `file:` protocol.
 */
export function removePathSync(path: string): boolean
{
    if (existsSync(path))
    {
        const lstat = lstatSync(path);

        if (lstat.isSymbolicLink() || lstat.isFile())
        {
            unlinkSync(path);
        }
        else
        {
            for (const fileOrDirectory of readdirSync(path))
            {
                removePathSync(join(path, fileOrDirectory));
            }

            rmdirSync(path);
        }

        return true;
    }

    return false;
}

/**
 * Asynchronously delete a path recursively and unlink symbolic links
 * @param path Path to delete. If a URL is provided, it must use the `file:` protocol.
 */
export async function removePath(path: string): Promise<boolean>
{
    if (existsSync(path))
    {
        const stat = await lstat(path);

        if (stat.isSymbolicLink() || stat.isFile())
        {
            await unlink(path);
        }
        else
        {
            for (const fileOrDirectory of await readdir(path))
            {
                await removePath(join(path, fileOrDirectory));
            }

            await rmdir(path);
        }

        return true;
    }

    return false;
}