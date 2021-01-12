/* eslint-disable max-len */
import { exec }            from "child_process";
import fs                  from "fs";
import path                from "path";
import { fileURLToPath }   from "url";
import { promisify }       from "util";
import chalk               from "chalk";
import type { Credential } from "npm-registry-client";
import
{
    backupFile,
    cleanup,
    execute,
    filterPackages,
    log,
    lookup,
    paths,
    removePathAsync,
    restoreBackup,
} from "./common.js";
import Depsync       from "./depsync.js";
import StrategyType  from "./enums/strategy-type.js";
import NpmRepository from "./npm-repository.js";
import patterns      from "./patterns.js";
import Publisher     from "./publisher.js";

const execAsync      = promisify(exec);
const readFileAsync  = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const dirname = path.dirname(fileURLToPath(import.meta.url));
const tsc     = path.resolve(dirname, "../../node_modules/.bin/tsc");

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

    private static async sync(options: { modules?: string[], strategy?: StrategyType, template?: string }): Promise<void>
    {
        const { modules, strategy, template } = options;

        const syncedPackages = await Depsync.sync(lookup, modules, { strategy, template });

        for (const $package of syncedPackages)
        {
            const filepath = path.join(paths.packages.root, $package.name, "package.json");

            await writeFileAsync(filepath, JSON.stringify($package, null, 4));

            log(`Updated ${$package.name} ${chalk.gray(filepath)}`);
        }
    }

    public static async backup({ modules = [] as string[] } = { }): Promise<void>
    {
        const commands: Promise<void>[] = [];

        for (const $package of filterPackages(lookup.values(), modules))
        {
            const manifest = path.normalize(path.resolve(paths.packages.root, $package.name, "package.json"));

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
            const source = path.normalize(path.resolve(paths.packages.root, $package.name));

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
            const source = path.normalize(path.resolve(paths.packages.root, $package.name));

            log(`Cleaning ${chalk.bold.blue($package.name)}`);

            if (nodeModules)
            {
                commands.push(removePathAsync(path.join(source, "node_modules")));
            }

            commands.push(cleanup(source, patterns.clean.includes, patterns.clean.excludes));
        }

        await Promise.all(commands);

        log(chalk.bold.green("Cleaning done!"));
    }

    public static async cover(filepath: string): Promise<void>
    {
        const bin   = path.resolve(dirname, "../../node_modules/.bin");
        const mocha = path.join(bin, "mocha");
        const c8    = path.join(bin, "c8");

        const file = path.parse(filepath);

        const target = file.name.replace(".spec", "");

        const command = `${c8} --include **/@surface/**/${target}.js --include **/@surface/**/${target}.ts --exclude=**/tests --extension .js --extension .ts --reporter=text ${mocha} --loader=@surface/mock-loader --ui=tdd ${path.join(file.dir, file.name)}.js`;

        await execute(`cover ${chalk.bold.blue(filepath)} tests`, command);
    }

    public static async publish(registry: string, options: PublishOptions): Promise<void>
    {
        const exclude = (await readFileAsync(path.join(dirname, "../.publishignore")))
            .toString()
            .split("\n")
            .map(x => x.trim());

        await Tasks.build({ declaration: true });

        await Tasks.backup();

        try
        {
            if (options.config == "release")
            {
                const version = options.target
                    ? options.target
                    : await Tasks.getTag();

                if (version)
                {
                    await Tasks.sync({ strategy: StrategyType.Default, template: version });
                }
            }
            else
            {
                const timestamp = new Date().toISOString()
                    .replace(/[-T:]/g, "")
                    .substring(0, 12);

                await Tasks.sync({ strategy: StrategyType.ForceVersion, template: `*.*.*-dev.${timestamp}` });
            }

            const auth = { alwaysAuth: true, token: options.token } as Credential;

            const packages = filterPackages(lookup.values(), options.modules ?? [], exclude).map(x => x.name);

            await new Publisher(lookup, new NpmRepository(registry, true), auth, "public", options.debug).publish(packages);
        }
        catch (error)
        {
            log(error.message);
        }

        await Tasks.restore();
    }

    public static async restore({ modules = [] as string[] } = { }): Promise<void>
    {
        const commands: Promise<void>[] = [];

        for (const $package of filterPackages(lookup.values(), modules))
        {
            const manifest = path.normalize(path.resolve(paths.packages.root, $package.name, "package.json"));

            commands.push(restoreBackup(manifest));

            log(`Restoring backup of ${chalk.bold.blue($package.name)}`);
        }

        await Promise.all(commands);

        log(chalk.bold.green("Restoring backup done!"));
    }
}