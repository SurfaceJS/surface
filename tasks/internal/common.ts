/* eslint-disable @typescript-eslint/no-require-imports */
import child_process                        from "child_process";
import fs                                   from "fs";
import { createRequire }                    from "module";
import path                                 from "path";
import { fileURLToPath }                    from "url";
import util                                 from "util";
import { createPathAsync, removePathAsync } from "@surface/io";
import chalk                                from "chalk";
import type { IPackage }                    from "npm-registry-client";
import StrategyType                         from "./enums/strategy-type.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const copyFileAsync = util.promisify(fs.copyFile);
const execAsync     = util.promisify(child_process.exec);
const symlinkAsync  = util.promisify(fs.symlink);
const lstatAsync    = util.promisify(fs.lstat);
const readdirAsync  = util.promisify(fs.readdir);
const renameAsync   = util.promisify(fs.rename);
const unlinkAsync   = util.promisify(fs.unlink);

function *filterLookupEnumerator(source: Iterable<IPackage>, include: Iterable<string>, exclude: Iterable<string>): Iterable<IPackage>
{
    const includeSet = new Set(include);
    const excludeSet = new Set(exclude);

    for (const element of source)
    {
        if ((includeSet.size == 0 || includeSet.has(element.name)) && !excludeSet.has(element.name))
        {
            yield element;
        }
    }
}

export function assert(condition: unknown, message?: string): asserts condition
{
    if (!condition)
    {
        throw new Error(message);
    }
}

export async function backupFile(source: string): Promise<void>
{
    await copyFileAsync(source, `${source}.backup`);
}

export function buildLookup(packagesRoot: string): Map<string, IPackage>
{
    const packages = Array.from(fs.readdirSync(packagesRoot))
        .map(x => path.join(packagesRoot, x, "package.json"))
        .filter(x => fs.existsSync(x))
        .map(require)
        .map((x: IPackage) => [x.name, x] as [string, IPackage]);

    return new Map(packages);
}

export async function cleanup(targetPath: string, include: RegExp, exclude: RegExp): Promise<void>
{
    for (const filename of (await readdirAsync(targetPath)).map(x => path.join(targetPath, x)))
    {
        if (!exclude.test(filename))
        {
            if ((await lstatAsync(filename)).isDirectory())
            {
                await cleanup(filename, include, exclude);
            }
            else if (include.test(filename))
            {
                log(`Deleting ${chalk.red(filename)}`);

                await unlinkAsync(filename);
            }
        }
        else
        {
            log(`Ignoring ${chalk.grey(filename)}`);
        }
    }
}

export async function createLink(target: string, path: string): Promise<void>
{
    await symlinkAsync(target, path, "junction");
}

export function dashedToTitle(value: string): string
{
    return value.replace(/(^[a-z]|-[a-z])/g, (_, group) => group.replace(/-/g, "").toUpperCase());
}

export function except<T>(include: T[], exclude: T[]): T[]
{
    const set = new Set(exclude);

    return include.filter(x => !set.has(x));
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
    catch (err)
    {
        console.log(err.message);
    }
}

export function filterPackages(source: Iterable<IPackage>, include: Iterable<string>, exclude: Iterable<string> = []): IPackage[]
{
    return Array.from(filterLookupEnumerator(source, include, exclude));
}

export function log(message: unknown): void
{
    console.log(`${chalk.gray(`[${new Date().toISOString()}]`)} ${message}`);
}

export function parsePatternPath(pattern: string): RegExp
{
    let expression = "";

    for (let index = 0, len = pattern.length; index < len; index++)
    {
        const character = pattern[index];

        switch (character)
        {
            case "/":
                expression += "(\\/|\\\\)";
                break;
            case ".":
                expression += `\\${character}`;
                break;
            case "*":
                {
                    const previous = pattern[index - 1];

                    let starCount = 1;

                    while (pattern[index + 1] == "*")
                    {
                        starCount++;
                        index++;
                    }

                    const next = pattern[index + 1];

                    const isGlobstar = starCount > 1
                        && (previous == "/" || !previous)
                        && (next     == "/" || !next);

                    if (isGlobstar)
                    {
                        expression += "(.*)(\\/|\\\\)?";
                        index++;
                    }
                    else
                    {
                        expression += "([^\\/\\\\]*)";
                    }
                }
                break;
            default:
                expression += character;
        }
    }

    expression = `^${expression}$`;

    return new RegExp(expression);
}

export async function restoreBackup(source: string): Promise<void>
{
    await renameAsync(`${source}.backup`, source);

    await removePathAsync(`${source}.backup`);
}

export function typeGuard<T>(target: unknown, condition: boolean): target is T
{
    return condition;
}

export const paths =
{
    root:   path.resolve(dirname, "../.."),
    source:
    {
        root:    path.resolve(dirname, "../../source"),
        surface: path.resolve(dirname, "../../source/@surface"),
    },
};

export const lookup = buildLookup(paths.source.surface);

export const parsePattern = (pattern: RegExp) =>
    (value: string = ""): string =>
    {
        if (pattern.test(value))
        {
            return value.toLowerCase();
        }

        throw new Error(`'${value}' dont match the pattern ${pattern}`);
    };

export const toArray         = (source: string): string[] => source.split(",");
export const toStrategyFlags = (source: string): StrategyType =>
{
    const flags = source.split(",").map(dashedToTitle);

    let flag = StrategyType.Default;

    for (const key of flags)
    {
        if (typeGuard<keyof typeof StrategyType>(key, key in StrategyType))
        {
            flag |= StrategyType[key];
        }
        else
        {
            throw new Error(`Unsuported strategy type ${key}`);
        }
    }

    return flag;
};
export const toString = (source: string): string => source;

export { createPathAsync, removePathAsync };