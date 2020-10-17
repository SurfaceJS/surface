/* eslint-disable max-len */
import { exec }       from "child_process";
import fs             from "fs";
import path           from "path";
import { promisify }  from "util";
import chalk          from "chalk";
import { Credential } from "npm-registry-client";
import
{
    backupFile,
    cleanup,
    createLink,
    createPathAsync,
    execute,
    filterPackages,
    log,
    lookup,
    paths,
    removePathAsync,
    restoreBackup,
} from "./common";
import Depsync       from "./depsync";
import StrategyType  from "./enums/strategy-type";
import NpmRepository from "./npm-repository";
import patterns      from "./patterns";
import Publisher     from "./publisher";

const execAsync      = promisify(exec);
const readFileAsync  = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const tsc = path.resolve(__dirname, "../../node_modules/.bin/tsc");

type PublishOptions =
{
    config?:   "development" | "release",
    debug?:    boolean,
    modules?:  string[],
    strategy?: StrategyType,
    target?:   string,
    token:     string,
};

export default class Tasks
{
    private static async getTag(): Promise<string | undefined>
    {
        return (await execAsync("git tag --points-at HEAD")).stdout;
    }

    public static async backup({ modules = [] as string[] } = { }): Promise<void>
    {
        const commands: Promise<void>[] = [];

        for (const $package of filterPackages(lookup.values(), modules))
        {
            const manifest = path.normalize(path.resolve(paths.source.root, $package.name, "package.json"));

            commands.push(backupFile(manifest));

            log(`Backuping ${chalk.bold.blue($package.name)}`);
        }

        await Promise.all(commands);

        log(chalk.bold.green("Backuping modules done!"));
    }

    public static async build({ modules = [] as string[], declaration = false } = { }): Promise<void>
    {
        const commands: Promise<void>[] = [];

        for (const $package of filterPackages(lookup.values(), modules))
        {
            const source = path.normalize(path.resolve(paths.source.root, $package.name));

            commands.push(execute(`Building ${chalk.bold.blue($package.name)}`, `${tsc} -p ${source} --declaration ${declaration}`));
        }

        await Promise.all(commands);

        log(chalk.bold.green("Building modules done!"));
    }

    public static async clean({ modules = [] as string[], nodeModules = false } = { }): Promise<void>
    {
        const commands: Promise<unknown>[] = [];

        for (const $package of filterPackages(lookup.values(), modules))
        {
            const source = path.normalize(path.resolve(paths.source.root, $package.name));

            log(`Cleaning ${chalk.bold.blue($package.name)}`);

            if (nodeModules)
            {
                commands.push(removePathAsync(path.join(source, "node_modules")));
                commands.push(removePathAsync(path.join(source, "package-lock.json")));
            }

            commands.push(cleanup(source, patterns.clean.includes, patterns.clean.excludes));
        }

        await Promise.all(commands);

        log(chalk.bold.green("Cleaning done!"));
    }

    public static async cover(filepath: string): Promise<void>
    {
        const bin = path.resolve(__dirname, "../../node_modules/.bin");

        const file = path.parse(filepath);

        const target = file.name.replace(".spec", "");

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
                commands.push(execute(`Installing ${chalk.bold.blue($package.name)} dependencies.`, `cd ${path.resolve(paths.source.root, $package.name)} && npm install ${targets} --save-exact --silent`));
            }
        }

        await Promise.all(commands);

        await Tasks.link({ modules });

        log(chalk.bold.green("Installing done!"));
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

                await createPathAsync(path.join(nodeModules, "@surface"));

                if (!fs.existsSync(symlink))
                {
                    log(`Linking ${chalk.bold.magenta(key)} to ${chalk.bold.blue($package.name)}`);

                    await createLink(original, symlink);
                }
            }
        }

        log(chalk.bold.green("Linking done!"));
    }

    public static async publish(registry: string, options: PublishOptions): Promise<void>
    {
        const exclude = (await readFileAsync(path.join(__dirname, "../.publishignore")))
            .toString()
            .split("\n")
            .map(x => x.trim());

        await Tasks.build({ declaration: true });

        if (options.config == "development")
        {
            await Tasks.backup();

            const timestamp = new Date().toISOString()
                .replace(/[-T:]/g, "")
                .substring(0, 12);

            await Tasks.sync({ strategy: StrategyType.ForceVersion, template: `*.*.*-dev.${timestamp}` });

            await Tasks.restore();
        }
        else
        {
            const version = options.target
                ? options.target
                : await Tasks.getTag();

            if (version)
            {
                await Tasks.sync({ strategy: StrategyType.Default, template: version });
            }
        }

        const auth = { alwaysAuth: true, token: options.token } as Credential;

        const packages = filterPackages(lookup.values(), options.modules ?? [], exclude).map(x => x.name);

        await new Publisher(lookup, new NpmRepository(registry, true), auth, "public", options.debug).publish(packages);
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

            log(`Restoring backup of ${chalk.bold.blue($package.name)}`);
        }

        await Promise.all(commands);

        log(chalk.bold.green("Restoring backup done!"));
    }

    public static async setup(): Promise<void>
    {
        await Tasks.clean();
        await Tasks.install();
        await Tasks.build();
    }

    public static async sync(options: { modules?: string[], strategy?: StrategyType, template?: string }): Promise<void>
    {
        const { modules, strategy, template } = options;

        const syncedPackages = await Depsync.sync(lookup, modules, { strategy, template });

        for (const $package of syncedPackages)
        {
            const filepath = path.join(paths.source.root, $package.name, "package.json");

            await writeFileAsync(filepath, JSON.stringify($package, null, 4));

            log(`Updated ${$package.name} ${chalk.gray(filepath)}`);
        }
    }

    public static async unlink({ modules = [] as string[] } = { }): Promise<void>
    {
        for (const $package of filterPackages(lookup.values(), modules))
        {
            const targetFolder = path.normalize(path.join(paths.source.root, $package.name, "node_modules", "@surface"));

            if (fs.existsSync(targetFolder))
            {
                log(`Unlinking @surface on ${chalk.bold.blue($package.name)}`);

                await removePathAsync(targetFolder);
            }
        }

        log(`${chalk.bold.green("Unlinking done!")}`);

        await Promise.resolve();
    }
}