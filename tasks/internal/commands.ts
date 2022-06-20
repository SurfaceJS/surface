/* eslint-disable max-len */
import { readFile, writeFile } from "fs/promises";
import path                    from "path";
import { fileURLToPath }       from "url";
import { resolveError }        from "@surface/core";
import chalk                   from "chalk";
import JSON5                   from "json5";
import
{
    backupFile,
    execute,
    log,
    lookup,
    paths,
    restoreBackup,
} from "./common.js";
import DepSync                from "./dep-sync.js";
import StrategyType           from "./enums/strategy-type.js";
import NpmRepository          from "./npm-repository.js";
import Publisher              from "./publisher.js";
import type CliPublishOptions from "./types/cli-publish-options.js";
import type SemanticVersion   from "./types/semantic-version";

const DIRNAME       = path.dirname(fileURLToPath(import.meta.url));
const TSC           = path.resolve(DIRNAME, "../../node_modules/.bin/tsc");
const TSCONFIG_PATH = path.resolve(DIRNAME, "../../tsconfig.json");

type TsConfig =
{
    compilerOptions:
    {
        sourceMap: boolean,
    },
};

export default class Commands
{
    private static async disableReleaseBuild(): Promise<void>
    {
        await restoreBackup(TSCONFIG_PATH);

        log("Release build disabled...");
    }

    private static async enableReleaseBuild(): Promise<void>
    {
        await backupFile(TSCONFIG_PATH);

        const tsconfig = JSON5.parse((await readFile(TSCONFIG_PATH)).toString()) as TsConfig;

        tsconfig.compilerOptions.sourceMap = false;

        await writeFile(TSCONFIG_PATH, JSON.stringify(tsconfig, null, 4));

        log("Release build enabled...");
    }

    private static async sync(strategy: StrategyType, version?: SemanticVersion): Promise<void>
    {
        const syncedPackages = await DepSync.sync(lookup, { strategy, version });

        for (const $package of syncedPackages)
        {
            const filepath = path.join(paths.packages.root, $package.name, "package.json");

            await writeFile(filepath, JSON.stringify($package, null, 4));

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

            log(`Making Backup ${chalk.bold.blue($package.name)}`);
        }

        await Promise.all(commands);

        log(chalk.bold.green("Making Backup modules done!"));
    }

    public static async build(): Promise<void>
    {
        await this.enableReleaseBuild();

        await execute("Building...", `${TSC} --build "${TSCONFIG_PATH}"`);

        await this.disableReleaseBuild();

        log(chalk.bold.green("Building modules done!"));
    }

    public static async clean(): Promise<void>
    {
        await execute("Cleaning...", `${TSC} --build "${TSCONFIG_PATH}" --clean`);

        log(chalk.bold.green("Cleaning done!"));
    }

    public static async cover(filepath: string): Promise<void>
    {
        const bin   = path.resolve(DIRNAME, "../../node_modules/.bin");
        const mocha = path.join(bin, "mocha");
        const c8    = path.join(bin, "c8");

        const file   = path.parse(filepath);
        const spec   = `${path.relative(process.cwd(), path.join(file.dir, file.name.replace(/((?:\.[-a-zA-Z0-9]+)*\.(?:scn))/, ".spec")))}.js`;
        const target = file.name.replace(/((?:\.\w+)*\.(?:scn|spec))/, "");

        const command = `${c8} --text-exclude --include=**/@surface/**/${target}.js --include=**/@surface/**/${target}.ts --exclude=**/tests --exclude=**/node_modules --extension=.js --extension=.ts --reporter=text ${mocha} --loader=@surface/mock-loader --reporter=progress ${spec}`;

        await execute(`cover ${chalk.bold.blue(target)} tests`, command);
    }

    public static async test(filepath: string): Promise<void>
    {
        const bin   = path.resolve(DIRNAME, "../../node_modules/.bin");
        const mocha = path.join(bin, "mocha");
        const file  = path.parse(filepath);
        const spec  = `${path.relative(process.cwd(), path.join(file.dir, file.name.replace(/((?:\.[-a-zA-Z0-9]+)*\.(?:scn))/, ".spec")))}.js`;

        const command = `${mocha} --loader=@surface/mock-loader ${spec}`;

        await execute(`test ${chalk.bold.blue(filepath)}`, command);
    }

    public static async publish(_: string, options: CliPublishOptions): Promise<void>
    {
        const publishignore = (await readFile(path.join(DIRNAME, "../.publishignore"))).toString();

        const exclude = new Set(publishignore.split("\n").map(x => x.trim()));

        await Commands.clean();
        await Commands.build();
        await Commands.backup();

        try
        {
            if (options.mode == "release")
            {
                await Commands.sync(StrategyType.Default);
            }
            else
            {
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                const timestamp = options.timestamp || new Date().toISOString()
                    .replace(/[-T:]/g, "")
                    .substring(0, 12);

                await Commands.sync(StrategyType.ForceVersion, `*.*.*-dev.${timestamp}` as SemanticVersion);
            }

            const packages = Array.from(lookup.keys()).filter(x => !exclude.has(x));

            const repository = new NpmRepository(options.token);

            await new Publisher(repository, lookup, options.dry).publish(packages);
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
