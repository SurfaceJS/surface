import { Nullable } from "@surface/core";
import fs                    from "fs";
import path                  from "path";

export function deletePath(targetPath: string): boolean
{
    if (fs.existsSync(targetPath))
    {
        if (fs.lstatSync(targetPath).isSymbolicLink())
        {
            fs.unlinkSync(targetPath);
        }
        else if (fs.lstatSync(targetPath).isFile())
        {
            fs.unlinkSync(targetPath);
        }
        else
        {
            for (const fileOrDirectory of fs.readdirSync(targetPath))
            {
                deletePath(path.join(targetPath, fileOrDirectory));
            }

            fs.rmdirSync(targetPath);
        }

        return true;
    }

    return false;
}

/**
 * Resolve file location
 * @param context   Cotext used to resolve.
 * @param filepath  Relative or absolute path to folder or file.
 * @param filenames Possible filenames to resolve.
 */
export function resolveFile(context: string, filepaths: Array<string>): string
{
    for (const filepath of filepaths)
    {
        if (path.isAbsolute(filepath) && fs.existsSync(filepath))
        {
            return filepath;
        }
        else
        {
            const resolved = path.resolve(context, filepath);

            if (fs.existsSync(resolved))
            {
                return resolved;
            }
        }
    }

    throw new Error("paths not found");
}

/**
 * Look up for target file/directory.
 * @param startPath Path to start resolution.
 * @param target    Target file/directory.
 */
export function lookUp(startPath: string, target: string): Nullable<string>
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
 * Create a directory.
 * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
 */
export function makePath(path: string): void;
/**
 * Create a directory.
 * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
 * @param mode A file mode.
 */
export function makePath(path: string, mode:  number): void;
export function makePath(targetPath: string, mode?: number): void
{
    if (fs.existsSync(targetPath))
    {
        targetPath = fs.lstatSync(targetPath).isSymbolicLink() ? fs.readlinkSync(targetPath) : targetPath;

        if (!fs.lstatSync(targetPath).isDirectory())
        {
            throw new Error(`${targetPath} exist and isn't an directory`);
        }

        return;
    }

    const parentDir = path.dirname(targetPath.toString());
    // tslint:disable-next-line:no-magic-numbers
    mode = mode || parseInt("0777", 8) & (~process.umask());

    if (!fs.existsSync(parentDir))
    {
        makePath(parentDir, mode);
        return fs.mkdirSync(targetPath, mode);
    }
    else
    {
        return fs.mkdirSync(targetPath, mode);
    }
}

/**
 * Asynchronous create a directory.
 * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
 */
export async function makePathAsync(path: string): Promise<void>;
/**
 * Asynchronous create a directory.
 * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
 * @param mode A file mode.
 */
export async function makePathAsync(path: string, mode:  number): Promise<void>;
export async function makePathAsync(targetPath: string, mode?: number): Promise<void>
{
    await Promise.resolve(makePath(targetPath, mode || mode || parseInt("0777", 8) & (~process.umask())));
}

/**
 * Deeply merges two or more objects.
 * @param target Object to receive merge.
 * @param source Objects to merge to the target.
 */
export function merge<TTarget = object, TSource = object>(target: TTarget, source: Array<TSource>): TTarget & TSource;
/**
 * Deeply merges two or more objects, and optionally concatenate array values.
 * @param target        Object to receive merge.
 * @param source        Object to merge to the target.
 * @param combineArrays Specify to combine or not arrays.
 */
export function merge<TTarget = object, TSource = object>(target: TTarget, source: Array<TSource>, combineArrays: boolean): TTarget & TSource;
/**
 * Deeply merges two objects.
 * @param target Object to receive merge.
 * @param source Objects to merge to the target.
 */
export function merge<TTarget = object, TSource = object>(target: TTarget, source: TSource): TTarget & TSource;
/**
 * Deeply merges two objects, and optionally concatenate array values.
 * @param target Object to receive merge.
 * @param source Object to merge to the target.
 * @param combineArrays
 */
export function merge<TTarget = object, TSource = object>(target: TTarget, source: TSource, combineArrays: boolean): TTarget & TSource;
export function merge<TTarget = object, TSource = object>(target: TTarget, source: TSource|Array<TSource>, combineArrays?: boolean): TTarget & TSource
{
    combineArrays = !!combineArrays;

    if (!Array.isArray(source))
    {
        source = [source];
    }

    for (const current of source)
    {
        for (const key of Object.getOwnPropertyNames(current))
        {
            if (target[key] instanceof Object)
            {
                if (Array.isArray(target[key]) && Array.isArray(current[key]) && combineArrays)
                {
                    target[key] = target[key].concat(current[key]);
                }
                else if (current[key] instanceof Object)
                {
                    target[key] = merge(target[key], current[key], combineArrays);
                }
                else if (current[key] != undefined)
                {
                    target[key] = current[key];
                }
            }
            else if (current[key] != undefined)
            {
                target[key] = current[key];
            }
        }
    }

    return target as TTarget & TSource;
}