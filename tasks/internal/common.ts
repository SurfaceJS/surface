/* eslint-disable @typescript-eslint/no-require-imports */
import child_process                                    from "child_process";
import { existsSync, readdirSync }                      from "fs";
import { copyFile, lstat, readdir, rename, rm, unlink } from "fs/promises";
import { createRequire }                                from "module";
import path                                             from "path";
import { fileURLToPath }                                from "url";
import { promisify }                                    from "util";
import { resolveError }                                 from "@surface/core";
import { createPath, removePath }             from "@surface/io";
import chalk                                            from "chalk";
import type { Manifest }                                from "pacote";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const execAsync = promisify(child_process.exec);

export function assert(condition: unknown, message?: string): asserts condition
{
    if (!condition)
    {
        throw new Error(message);
    }
}

export async function backupFile(source: string): Promise<void>
{
    await copyFile(source, `${source}.backup`);
}

export async function cleanup(targetPath: string, include: RegExp, exclude: RegExp): Promise<void>
{
    for (const filename of (await readdir(targetPath)).map(x => path.join(targetPath, x)))
    {
        if (!exclude.test(filename))
        {
            if ((await lstat(filename)).isDirectory())
            {
                await cleanup(filename, include, exclude);
            }
            else if (include.test(filename))
            {
                log(`Deleting ${chalk.red(filename)}`);

                await unlink(filename);
            }
        }
        else
        {
            log(`Ignoring ${chalk.grey(filename)}`);
        }
    }
}

export function dashedToTitle(value: string): string
{
    return value.replace(/(^[a-z]|-[a-z])/g, (_, group) => group.replace(/-/g, "").toUpperCase());
}

export async function execute(label: string, command: string): Promise<void>
{
    try
    {
        log(label);
        const { stdout, stderr } = await execAsync(command);

        if (stdout)
        {
            console.log(stdout);
        }

        if (stderr)
        {
            console.log(stderr);
        }
    }
    catch (error)
    {
        console.log(resolveError(error).message);
    }
}

export function getPackages(packagesRoot: string): Manifest[]
{
    return Array.from(readdirSync(packagesRoot))
        .map(x => path.join(packagesRoot, x, "package.json"))
        .filter(x => existsSync(x))
        .map(require);
}

export function log(message: unknown): void
{
    console.log(`${chalk.gray(`[${new Date().toISOString()}]`)} ${message}`);
}

export async function restoreBackup(source: string): Promise<void>
{
    await rm(source);
    await rename(`${source}.backup`, source);
}

export function toLookup(packages: Manifest[]): Map<string, Manifest>
{
    return new Map(packages.map((x: Manifest) => [x.name, x] as [string, Manifest]));
}

export function typeGuard<T>(_: unknown, condition: boolean): _ is T
{
    return condition;
}

export const paths =
{
    packages:
    {
        root:    path.resolve(dirname, "../../packages"),
        surface: path.resolve(dirname, "../../packages/@surface"),
    },
    root: path.resolve(dirname, "../.."),
};

export const lookup = toLookup(getPackages(paths.packages.surface));

export const parsePattern = (pattern: RegExp) =>
    (value: string = ""): string =>
    {
        if (pattern.test(value))
        {
            return value.toLowerCase();
        }

        throw new Error(`'${value}' dont match the pattern ${pattern}`);
    };

export const toArray  = (source: string): string[] => source.split(",");
export const toString = (source: string): string => source;

export { createPath as createPathAsync, removePath as removePathAsync };