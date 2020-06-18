import chalk            from "chalk";
import child_process    from "child_process";
import fs               from "fs";
import { IPackage }     from "npm-registry-client";
import path             from "path";
import util             from "util";
import { StrategyType } from "./depsync";

const copyFileAsync = util.promisify(fs.copyFile);
const execAsync     = util.promisify(child_process.exec);
const lstatAsync    = util.promisify(fs.lstat);
const readdirAsync  = util.promisify(fs.readdir);
const renameAsync   = util.promisify(fs.rename);
const unlinkAsync   = util.promisify(fs.unlink);

export const paths =
{
    root: path.resolve(__dirname, "../.."),
    source:
    {
        root:    path.resolve(__dirname, "../../source"),
        surface: path.resolve(__dirname, "../../source/@surface")
    }
};

export const lookup = buildLookup(paths.source.surface);

export function assert(condition: unknown, message?: string): asserts condition
{
    if (!condition)
    {
        throw new Error(message);
    }
}

export async function backupFile(source: string): Promise<void>
{
    // await writeFileAsync(`${source}.backup`, (await readFileAsync(source)).toString());
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

export async function cleanup(targetPath: string, pattern: RegExp, exclude: RegExp): Promise<void>
{
    for (const source of (await readdirAsync(targetPath)).map(x => path.join(targetPath, x)))
    {
        if (exclude.test(source))
        {
            continue;
        }

        if ((await lstatAsync(source)).isDirectory())
        {
            await cleanup(source, pattern, exclude);
        }
        else if (pattern.test(source))
        {
            await unlinkAsync(source);
        }
    }
}

export function createPath(targetPath: string, mode: number = 0o777): void
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

    if (!fs.existsSync(parentDir))
    {
        createPath(parentDir, mode);
        return fs.mkdirSync(targetPath, mode);
    }
    else
    {
        return fs.mkdirSync(targetPath, mode);
    }
}

export function dashedToTitle(value: string): string
{
    return value.replace(/(^[a-z]|-[a-z])/g, (_, group) => group.replace(/-/g, "").toUpperCase());
}

export function except<T>(include: Array<T>, exclude: Array<T>): Array<T>
{
    const set = new Set(exclude);

    return include.filter(x => !set.has(x));
}

export async function execute(label: string, command: string): Promise<void>
{
    try
    {
        console.log(label);
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

export function filterPackages(source: Iterable<IPackage>, include: Iterable<string>, exclude: Iterable<string> = []): Array<IPackage>
{
    return Array.from(filterLookupEnumerator(source, include, exclude));
}

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

export async function restoreBackup(source: string): Promise<void>
{
    // await writeFileAsync(source, (await readFileAsync(`${source}.backup`)).toString());
    await renameAsync(`${source}.backup`, source);

    removePath(`${source}.backup`);
}

export function timestamp(): string
{
    return chalk.bold.gray(`[${new Date().toISOString()}]`);
}

export function typeGuard<T>(target: unknown, condition: boolean): target is T
{
    return condition;
}

export const toArray         = (source: string) => source.split(",");
export const toStrategyFlags = (source: string) =>
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
export const toString = (source: string) => source;

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