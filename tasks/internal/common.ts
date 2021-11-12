/* eslint-disable @typescript-eslint/no-require-imports */
import child_process                        from "child_process";
import fs                                   from "fs";
import { createRequire }                    from "module";
import path                                 from "path";
import { fileURLToPath }                    from "url";
import util                                 from "util";
import { resolveError }                     from "@surface/core";
import { createPathAsync, removePathAsync } from "@surface/io";
import chalk                                from "chalk";
import type { Manifest }                    from "pacote";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const copyFileAsync = util.promisify(fs.copyFile);
const execAsync     = util.promisify(child_process.exec);
const lstatAsync    = util.promisify(fs.lstat);
const readdirAsync  = util.promisify(fs.readdir);
const renameAsync   = util.promisify(fs.rename);
const unlinkAsync   = util.promisify(fs.unlink);

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
    return Array.from(fs.readdirSync(packagesRoot))
        .map(x => path.join(packagesRoot, x, "package.json"))
        .filter(x => fs.existsSync(x))
        .map(require);
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

export const toArray         = (source: string): string[] => source.split(",");
export const toString = (source: string): string => source;

export { createPathAsync, removePathAsync };