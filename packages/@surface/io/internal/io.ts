import { existsSync, lstatSync, readdirSync, statSync } from "fs";
import { lstat, readdir, stat }                         from "fs/promises";
import { dirname, isAbsolute, join, resolve }           from "path";
import type { Callable }                                from "@surface/core";
import PathMatcher, { type Options }                    from "@surface/path-matcher";

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

function resolveRedundantPatterns(patterns: string | string[], options: Options): { matcher: PathMatcher, paths: string[] }
{
    const matcher = new PathMatcher(patterns, options);

    const paths: string[] = [];

    let path: string | null = null;

    for (const entry of Array.from(matcher.paths).sort())
    {
        if (path === null || !entry.startsWith(path))
        {
            paths.push(path = entry);
        }
    }

    return { matcher, paths };
}

async function *internalEnumeratePaths(context: string, matcher: PathMatcher): AsyncGenerator<string>
{
    for (const entry of await readdir(context))
    {
        const path = join(context, entry);

        if (!matcher.negatedPaths.has(path))
        {
            if (await isDirectory(path))
            {
                for await (const file of internalEnumeratePaths(path, matcher))
                {
                    yield file;
                }
            }
            else if (matcher.isMatch(path))
            {
                yield path;
            }
        }
    }
}

function *internalEnumeratePathsSync(context: string, matcher: PathMatcher): Generator<string>
{
    for (const entry of readdirSync(context))
    {
        const path = join(context, entry);

        if (!matcher.negatedPaths.has(path))
        {
            if (isDirectorySync(path))
            {
                for (const file of internalEnumeratePathsSync(path, matcher))
                {
                    yield file;
                }
            }
            else if (matcher.isMatch(path))
            {
                yield path;
            }
        }
    }
}

/**
 * Asynchronous enumerate paths using given patterns.
 * @param patterns Patterns to match. Strings prefixed with "!" will be negated.
 * @param options  Options to parse patterns.
 */
export async function *enumeratePaths(patterns: string | string[], options: Options = { base: process.cwd() }): AsyncGenerator<string>
{
    const resolved = resolveRedundantPatterns(patterns, options);

    for (const path of resolved.paths)
    {
        if (await isFile(path))
        {
            yield path;
        }
        else
        {
            for await (const iterator of internalEnumeratePaths(path, resolved.matcher))
            {
                yield iterator;
            }
        }
    }
}

/**
 * enumerate paths using given patterns.
 * @param patterns Patterns to match. Strings prefixed with "!" will be negated.
 * @param options  Options to parse patterns.
 */
export function *enumeratePathsSync(patterns: string | string[], options: Options = { base: process.cwd() }): Generator<string>
{
    const resolved = resolveRedundantPatterns(patterns, options);

    for (const path of resolved.paths)
    {
        if (isFileSync(path))
        {
            yield path;
        }
        else
        {
            for (const iterator of internalEnumeratePathsSync(path, resolved.matcher))
            {
                yield iterator;
            }
        }
    }
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
 * Asynchronous list paths using given patterns.
 * @param pattern Pattern to match.
 * @param cwd     Working dir.
 */
export async function listPaths(pattern: string | string[], options?: Options): Promise<string[]>
{
    const paths: string[] = [];

    for await (const path of enumeratePaths(pattern, options))
    {
        paths.push(path);
    }

    return paths;
}

/**
 * List paths using given patterns.
 * @param pattern Pattern to match.
 * @param cwd     Working dir.
 */
export function listPathsSync(pattern: string | string[], options?: Options): string[]
{
    return Array.from(enumeratePathsSync(pattern, options));
}

/**
 * Asynchronous resolve and returns the path of the first resolved file and null otherwise.
 * @param files   Files to look.
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
 * Looks from bottom to up for the target file/directory.
 * @param startPath Path to start resolution. If a URL is provided, it must use the `file:` protocol.
 * @param target Target file/directory.
 */
export function searchAbove(startPath: string, target: string): string | null
{
    const path = join(startPath, target);

    if (existsSync(path))
    {
        return path;
    }

    const parent = dirname(startPath);

    if (parent != startPath)
    {
        return searchAbove(parent, target);
    }

    return null;
}
