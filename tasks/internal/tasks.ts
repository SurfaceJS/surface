import fs             from "fs";
import path           from "path";
import { promisify }  from "util";
import chalk          from "chalk";
import { Credential } from "npm-registry-client";
import
{
    backupFile,
    cleanup,
    createPath,
    execute,
    filterPackages,
    lookup,
    paths,
    removePath,
    restoreBackup,
    timestamp,
} from "./common";
import Depsync       from "./depsync";
import NpmRepository from "./npm-repository";
import patterns      from "./patterns";
import Publisher     from "./publisher";
import StrategyType  from "./strategy-type";

const readFileAsync  = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

export default class Tasks
{
    public static async backup({ modules = [] as string[] } = { }): Promise<void>
    {
        const commands: Promise<void>[] = [];

        for (const $package of filterPackages(lookup.values(), modules))
        {
            const manifest = path.normalize(path.resolve(paths.source.root, $package.name, "package.json"));

            commands.push(backupFile(manifest));

            console.log(`${timestamp()} Backuping ${chalk.bold.blue($package.name)}`);
        }

        await Promise.all(commands);

        console.log(`${timestamp()} ${chalk.bold.green("Backuping modules done!")}`);
    }

    public static async build({ modules = [] as string[], declaration = false } = { }): Promise<void>
    {
        const commands: Promise<void>[] = [];

        for (const $package of filterPackages(lookup.values(), modules))
        {
            const source = path.normalize(path.resolve(paths.source.root, $package.name));

            commands.push(execute(`${timestamp()} Building ${chalk.bold.blue($package.name)}`, `tsc -p ${source} --declaration ${declaration}`));
        }

        await Promise.all(commands);

        console.log(`${timestamp()} ${chalk.bold.green("Building modules done!")}`);
    }

    public static async clean({ modules = [] as string[] } = { }): Promise<void>
    {
        const commands: Promise<void>[] = [];

        for (const $package of filterPackages(lookup.values(), modules))
        {
            const source = path.normalize(path.resolve(paths.source.root, $package.name));

            console.log(`${timestamp()} Cleaning ${chalk.bold.blue($package.name)}`);

            commands.push(cleanup(source, patterns.clean.include, patterns.clean.exclude));
        }

        await Promise.all(commands);

        console.log(`${timestamp()} ${chalk.bold.green("Cleaning done!")}`);
    }

    public static async cover(filepath: string): Promise<void>
    {
        const bin = path.resolve(__dirname, "../node_modules/.bin");

        const file = path.parse(filepath);

        const target = file.name.replace(".spec", "");

        // eslint-disable-next-line max-len
        await execute(`cover ${chalk.bold.blue(file.name)} tests`, `${path.join(bin, "nyc")} --include **/${target}.js --include **/${target}.ts --exclude=**/tests --extension .js --extension .ts --reporter=text ${path.join(bin, "mocha")} --ui tdd ${file.name}.js`);
    }

    public static async install({ modules = [] as string[] } = { }): Promise<void>
    {
        await Tasks.unlink({ modules });

        const commands: Promise<void>[] = [];

        for (const $package of filterPackages(lookup.values(), modules))
        {
            const dependencies = { ...$package.dependencies ?? { }, ...$package.devDependencies ?? { } };

            const targets = Object.entries(dependencies)
                .filter(([key, value]) => !key.startsWith("@surface/") && !value.startsWith("file:"))
                .map(([key, value]) => `${key}@${value.replace(/^(\^|~)/, "")}`)
                .join(" ");

            if (targets)
            {
                // eslint-disable-next-line max-len
                commands.push(execute(`${timestamp()} Installing ${chalk.bold.blue($package.name)} dependencies.`, `cd ${path.resolve(paths.source.root, $package.name)} && npm install ${targets} --save-exact`));
            }
        }

        await Promise.all(commands);

        await Tasks.link({ modules });

        console.log(`${timestamp()} ${chalk.bold.green("Installing done!")}`);
    }

    public static async link({ modules = [] as string[] } = { }): Promise<void>
    {
        for (const $package of filterPackages(lookup.values(), modules))
        {
            for (const key of Object.keys({ ...$package.dependencies, ...$package.devDependencies }).filter(x => x.startsWith("@surface/")))
            {
                const original    = path.normalize(path.resolve(paths.source.root, key));
                const nodeModules = path.normalize(path.join(paths.source.root, $package.name, "node_modules"));
                const symlink     = path.normalize(path.join(nodeModules, key));

                createPath(path.join(nodeModules, "@surface"));

                if (!fs.existsSync(symlink))
                {
                    await execute(`${timestamp()} Linking ${chalk.bold.magenta(key)} to ${chalk.bold.blue($package.name)}`, `mklink /J ${symlink} ${original}`);
                }
            }
        }

        console.log(chalk.bold.green(`${timestamp()} Linking done!`));
    }

    public static async publish(registry: string, options: { config: "development" | "release", token: string, include: string[], exclude: string[] }): Promise<void>
    {
        const exclude = (await readFileAsync(path.join(__dirname, "../.publishignore")))
            .toString()
            .split("\n")
            .map(x => x.trim())
            .concat(options.exclude);

        await Tasks.build({ declaration: true });

        if (options.config == "development")
        {
            await Tasks.backup();

            const timestamp = new Date().toISOString()
                .replace(/[-T:]/g, "")
                .substring(0, 12);

            await Tasks.sync({ strategy: StrategyType.ForceVersion, template: `*.*.*-dev.${timestamp}` });
        }

        const auth = { alwaysAuth: true, token: options.token } as Credential;

        await new Publisher(lookup, new NpmRepository(registry), auth, "public", true).publish(filterPackages(lookup.values(), options.include, exclude).map(x => x.name));

        if (options.config == "development")
        {
            await Tasks.restore();
        }
    }

    public static async relink({ modules = [] as string[] } = { }): Promise<void>
    {
        await Tasks.unlink({ modules });
        await Tasks.link({ modules });
    }

    public static async restore({ modules = [] as string[] } = { }): Promise<void>
    {
        const commands: Promise<void>[] = [];

        for (const $package of filterPackages(lookup.values(), modules))
        {
            const manifest = path.normalize(path.resolve(paths.source.root, $package.name, "package.json"));

            commands.push(restoreBackup(manifest));

            console.log(`${timestamp()} Restoring backup of ${chalk.bold.blue($package.name)}`);
        }

        await Promise.all(commands);

        console.log(`${timestamp()} ${chalk.bold.green("Restoring backup done!")}`);
    }

    public static async setup(): Promise<void>
    {
        await Tasks.clean();
        await Tasks.install();
        await Tasks.build();
    }

    public static async sync({ include = [], exclude = [], strategy, template }: { include?: string[], exclude?: string[], strategy?: StrategyType, template?: string }): Promise<void>
    {
        const packages = await Depsync.sync(lookup, filterPackages(lookup.values(), include, exclude).map(x => x.name), { strategy, template });

        for (const $package of packages)
        {
            const filepath = path.join(paths.source.root, $package.name, "package.json");

            await writeFileAsync(filepath, JSON.stringify($package, null, 4));

            console.log(`${timestamp()} Updated ${$package.name}`, chalk.gray(filepath));
        }
    }

    public static async unlink({ modules = [] as string[] } = { }): Promise<void>
    {
        for (const $package of filterPackages(lookup.values(), modules))
        {
            const targetFolder = path.normalize(path.join(paths.source.root, $package.name, "node_modules", "@surface"));

            if (fs.existsSync(targetFolder))
            {
                console.log(`${timestamp()} Unlinking @surface on ${chalk.bold.blue($package.name)}`);
                removePath(targetFolder);
            }
        }

        console.log(`${timestamp()} ${chalk.bold.green("Unlinking done!")}`);

        await Promise.resolve();
    }
}