/* eslint-disable max-len */
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
    log,
    lookup,
    paths,
    restoreBackup,
} from "./common.js";
import Depsync                from "./depsync.js";
import StrategyType           from "./enums/strategy-type.js";
import NpmRepository          from "./npm-repository.js";
import patterns               from "./patterns.js";
import Publisher              from "./publisher.js";
import type CliPublishOptions from "./types/cli-publish-options.js";
import type SemanticVersion   from "./types/semantic-version";

const readFileAsync  = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const dirname = path.dirname(fileURLToPath(import.meta.url));
const tsc     = path.resolve(dirname, "../../node_modules/.bin/tsc");

export default class Commands
{
    private static async sync(strategy: StrategyType, version?: SemanticVersion): Promise<void>
    {
        const syncedPackages = await Depsync.sync(lookup, { strategy, version });

        for (const $package of syncedPackages)
        {
            const filepath = path.join(paths.packages.root, $package.name, "package.json");

            await writeFileAsync(filepath, JSON.stringify($package, null, 4));

            log(`Updated ${$package.name} ${chalk.gray(filepath)}`);
        }
    }

    private static async backup(): Promise<void>
    {
        const commands: Promise<void>[] = [];

        for (const $package of lookup.values())
        {
            const manifest = path.normalize(path.resolve(paths.packages.root, $package.name, "package.json"));

            commands.push(backupFile(manifest));

            log(`Backuping ${chalk.bold.blue($package.name)}`);
        }

        await Promise.all(commands);

        log(chalk.bold.green("Backuping modules done!"));
    }

    public static async build(declaration: boolean = false): Promise<void>
    {
        const commands: Promise<void>[] = [];

        for (const $package of lookup.values())
        {
            const source = path.normalize(path.resolve(paths.packages.root, $package.name));

            commands.push(execute(`Building ${chalk.bold.blue($package.name)}`, `${tsc} -p ${source} --declaration ${declaration}`));
        }

        await Promise.all(commands);

        log(chalk.bold.green("Building modules done!"));
    }

    public static async clean(): Promise<void>
    {
        const commands: Promise<unknown>[] = [];

        for (const $package of lookup.values())
        {
            const source = path.normalize(path.resolve(paths.packages.root, $package.name));

            log(`Cleaning ${chalk.bold.blue($package.name)}`);

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

    public static async publish(registry: string, options: CliPublishOptions): Promise<void>
    {
        console.log(options.target);

        const publishignore = (await readFileAsync(path.join(dirname, "../.publishignore"))).toString();

        const exclude = new Set(publishignore.split("\n").map(x => x.trim()));

        await Commands.clean();
        await Commands.build(true);
        await Commands.backup();

        try
        {
            if (options.config == "release")
            {
                await Commands.sync(StrategyType.Default);
            }
            else
            {
                const timestamp = new Date().toISOString()
                    .replace(/[-T:]/g, "")
                    .substring(0, 12);

                await Commands.sync(StrategyType.ForceVersion, `*.*.*-dev.${timestamp}` as SemanticVersion);
            }

            const auth = { alwaysAuth: true, token: options.token } as Credential;

            const packages = Array.from(lookup.keys()).filter(x => !exclude.has(x));

            const repository = new NpmRepository(registry);

            await new Publisher(lookup, repository, auth, "public", options.debug).publish(packages);
        }
        catch (error)
        {
            log(error.message);
        }

        await Commands.restore();
    }

    public static async restore(): Promise<void>
    {
        const commands: Promise<void>[] = [];

        for (const $package of lookup.values())
        {
            const manifest = path.normalize(path.resolve(paths.packages.root, $package.name, "package.json"));

            commands.push(restoreBackup(manifest));

            log(`Restoring backup of ${chalk.bold.blue($package.name)}`);
        }

        await Promise.all(commands);

        log(chalk.bold.green("Restoring backup done!"));
    }
}