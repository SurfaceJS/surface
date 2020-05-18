import child_process from "child_process";
import fs            from "fs";
import path          from "path";
import util          from "util";

const exec = util.promisify(child_process.exec);

export function cleanup(targetPath: string, pattern: RegExp, exclude: RegExp): void
{
    for (const source of fs.readdirSync(targetPath).map(x => path.join(targetPath, x)))
    {
        if (exclude.test(source))
        {
            continue;
        }

        if (fs.lstatSync(source).isDirectory())
        {
            module.exports.cleanup(source, pattern, exclude);
        }
        else if (pattern.test(source))
        {
            fs.unlinkSync(source);
        }
    }
}

export function deletePath(targetPath: string): boolean
{
    if (fs.existsSync(targetPath))
    {
        const stats = fs.lstatSync(targetPath);

        if (stats.isFile() || stats.isSymbolicLink())
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

export async function execute(label: string, command: string): Promise<void>
{
    try
    {
        console.log(label);
        const { stdout, stderr } = await exec(command);

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

export function makePath(targetPath: string, mode?: string|number): void
{
    if (fs.existsSync(targetPath))
    {
        targetPath = fs.lstatSync(targetPath).isSymbolicLink() ? fs.readlinkSync(targetPath) : targetPath;

        if (!fs.lstatSync(targetPath).isDirectory())
        {
            throw new Error(`${targetPath} exist and isn't an directory.`);
        }

        return;
    }

    const parentDir = path.dirname(targetPath.toString());
    // tslint:disable-next-line:no-magic-numbers
    mode = mode ?? 0o777;

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