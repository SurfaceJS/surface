/* eslint-disable max-len */
import fs                  from "fs";
import path                from "path";
import { fileURLToPath }   from "url";
import { promisify }       from "util";
import { resolveError }    from "@surface/core";
import chalk               from "chalk";
import type { Credential } from "npm-registry-client";
import
{
    backupFile,
    execute,
    log,
    lookup,
    paths,
    restoreBackup,
} from "./common.js";
import Depsync                from "./depsync.js";
import StrategyType           from "./enums/strategy-type.js";
import NpmRepository          from "./npm-repository.js";
import Publisher              from "./publisher.js";
import type CliPublishOptions from "./types/cli-publish-options.js";
import type SemanticVersion   from "./types/semantic-version";

const readFileAsync  = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const DIRNAME  = path.dirname(fileURLToPath(import.meta.url));
const TSC      = path.resolve(DIRNAME, "../../node_modules/.bin/tsc");
const TSCONFIG = path.resolve(DIRNAME, "../../tsconfig.release.json");

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

    public static async build(): Promise<void>
    {
        await execute("Building...", `${TSC} --build "${TSCONFIG}"`);

        log(chalk.bold.green("Building modules done!"));
    }

    public static async clean(): Promise<void>
    {
        await execute("Cleaning...", `${TSC} --build "${TSCONFIG}" --clean`);

        log(chalk.bold.green("Cleaning done!"));
    }

    public static async cover(filepath: string): Promise<void>
    {
        const bin   = path.resolve(DIRNAME, "../../node_modules/.bin");
        const mocha = path.join(bin, "mocha");
        const c8    = path.join(bin, "c8");

        const file   = path.parse(filepath);
        const spec   = `${path.relative(process.cwd(), path.join(file.dir, file.name))}.js`;
        const target = file.name.replace(".spec", "");

        const command = `${c8} --text-exclude --include=**/@surface/**/${target}.js --include=**/@surface/**/${target}.ts --exclude=**/tests --extension=.js --extension=.ts --reporter=text ${mocha} --loader=@surface/mock-loader --ui=tdd ${spec}`;

        await execute(`cover ${chalk.bold.blue(filepath)} tests`, command);
    }

    public static async publish(registry: string, options: CliPublishOptions): Promise<void>
    {
        console.log(options.target);

        const publishignore = (await readFileAsync(path.join(DIRNAME, "../.publishignore"))).toString();

        const exclude = new Set(publishignore.split("\n").map(x => x.trim()));

        await Commands.clean();
        await Commands.build();
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

            const repository = new NpmRepository(registry, false);

            await new Publisher(lookup, repository, auth, "public", options.debug).publish(packages);
        }
        catch (error)
        {
            log(resolveError(error).message);
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