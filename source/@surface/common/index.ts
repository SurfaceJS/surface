import { Nullable } from "@surface/types";

import * as fs   from "fs";
import * as path from "path";
import * as util from "util";

/**
 * Resolve surface"s config file location
 * @param context  Cotext used to resolve.
 * @param filepath Relative or absolute path to folder or file.
 * @param filename Filename to resolve.
 */
export function resolveFile(context: string, filepath: string, filename: string);
/**
 * Resolve surface"s config file location
 * @param context   Cotext used to resolve.
 * @param filepath  Relative or absolute path to folder or file.
 * @param filenames Possible filenames to resolve.
 */
export function resolveFile(context: string, filepath: string, filenames: Array<string>);
export function resolveFile(context: string, filepath: string, filenames: string|Array<string>)
{
    if (!path.isAbsolute(filepath))
    {
        filepath = path.resolve(context, filepath);
    }

    if (fs.existsSync(filepath))
    {
        if (fs.lstatSync(filepath).isDirectory())
        {
            if (!Array.isArray(filenames))
            {
                filenames = [filenames];
            }

            for (let filename of filenames)
            {
                if (fs.existsSync(path.join(filepath, filename)))
                {
                    return path.join(filepath, filename);
                }
            }

            throw new Error("Configuration file not found");
        }

        return filepath;
    }
    else
    {
        throw new Error("Configuration file not found");
    }
}

/**
 * Look up for target file/directory.
 * @param startPath Path to start resolution.
 * @param target    Target file/directory.
 */
export function lookUp(startPath: string, target: string): Nullable<string>
{
    let slices = startPath.split(path.sep);

    while (slices.length > 0)
    {
        let filepath = path.join(slices.join("/"), target);

        if (fs.existsSync(filepath))
        {
            return filepath;
        }

        slices.pop();
    }

    return;
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
        if (!fs.lstatSync(targetPath).isDirectory())
        {
            throw new Error(`${targetPath} exist and isn't an directory.`);
        }

        return;
    }

    const parentDir = path.dirname(targetPath.toString());
    // tslint:disable-next-line:no-magic-numbers
    mode = parseInt("0777", 8) & (~process.umask());

    if(fs.existsSync(parentDir))
    {
        return makePath(parentDir, mode);
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
    const exists = util.promisify(fs.exists);
    const mkdir  = util.promisify(fs.mkdir);
    const stat   = util.promisify(fs.lstat);

    if (await exists(targetPath))
    {
        if (!(await stat(targetPath)).isDirectory())
        {
            throw new Error(`${targetPath} exist and isn't an directory.`);
        }

        return Promise.resolve();
    }

    const parentDir = path.dirname(targetPath.toString());
    // tslint:disable-next-line:no-magic-numbers
    mode = parseInt("0777", 8) & (~process.umask());

    if(await !exists(parentDir))
    {
        return makePathAsync(parentDir, mode);
    }
    else
    {
        return mkdir(targetPath, mode);
    }
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

    for (let current of source)
    {
        for (let key of Object.keys(current))
        {
            if (!current[key])
            {
                continue;
            }

            if (target[key] && target[key] instanceof Object)
            {
                if (Array.isArray(target[key]) && Array.isArray(current[key]) && combineArrays)
                {
                    target[key] = target[key].concat(current[key]);
                }
                else if (target[key] instanceof Object && current[key] instanceof Object && target[key].constructor.name == "Object" && current[key].constructor.name == "Object")
                {
                    target[key] = merge(target[key], current[key], combineArrays);
                }
                else if (current[key])
                {
                    let descriptor = Object.getOwnPropertyDescriptor(current, key);

                    if (descriptor && descriptor.enumerable)
                    {
                        target[key] = current[key];
                    }
                }
            }
            else if (current[key])
            {
                let descriptor = Object.getOwnPropertyDescriptor(current, key);

                if (descriptor && descriptor.enumerable)
                {
                    target[key] = current[key];
                }
            }
        }
    }

    return target as TTarget & TSource;
}

