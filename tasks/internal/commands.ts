/* eslint-disable max-len */
import { readFile, writeFile } from "fs/promises";
import path                    from "path";
import { fileURLToPath }       from "url";
import Logger, { LogLevel }    from "@surface/logger";
import { execute }             from "@surface/rwx";
import chalk                   from "chalk";
import JSON5                   from "json5";

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

const logger = new Logger(LogLevel.Trace);

export default class Commands
{
    public static async buildRelease(): Promise<void>
    {
        logger.trace("Cleaning...");

        await execute(`${TSC} --build "${TSCONFIG_PATH}" --clean`);

        logger.info("Cleaning done!");

        const content = (await readFile(TSCONFIG_PATH)).toString();

        const tsconfig = JSON5.parse(content) as TsConfig;

        tsconfig.compilerOptions = { ...tsconfig.compilerOptions, sourceMap: false };

        await writeFile(TSCONFIG_PATH, JSON.stringify(tsconfig, null, 4));

        logger.trace("Building...");

        await execute(`${TSC} --build "${TSCONFIG_PATH}"`);

        await writeFile(TSCONFIG_PATH, content);

        logger.info("Building modules done!");
    }

    public static async cover(filepath: string): Promise<void>
    {
        const bin   = path.resolve(DIRNAME, "../../node_modules/.bin");
        const mocha = path.join(bin, "mocha");
        const c8    = path.join(bin, "c8");

        const file    = path.parse(filepath);
        const spec    = `${path.relative(process.cwd(), path.join(file.dir, file.name.replace(/((?:\.[-a-zA-Z0-9]+)*\.(?:scn))/, ".spec")))}.js`;
        const target  = file.name.replace(/((?:\.\w+)*\.(?:scn|spec))/, "");
        const include = `**/packages/**/${target}`;

        const command = `${c8} --text-exclude --include=${include}.js --include=${include}.ts --exclude=**/tests --exclude=**/node_modules --extension=.js --extension=.ts --reporter=text ${mocha} --loader=@surface/mock-loader --reporter=progress ${spec} --color`;

        logger.info(`cover ${chalk.bold.blue(target)} tests`);

        await execute(command);
    }

    public static async test(filepath: string): Promise<void>
    {
        const bin   = path.resolve(DIRNAME, "../../node_modules/.bin");
        const mocha = path.join(bin, "mocha");
        const file  = path.parse(filepath);
        const spec  = `${path.relative(process.cwd(), path.join(file.dir, file.name.replace(/((?:\.[-a-zA-Z0-9]+)*\.(?:scn))/, ".spec")))}.js`;

        const command = `${mocha} --loader=@surface/mock-loader ${spec} --color`;

        logger.info(`test ${chalk.bold.blue(filepath)}`);

        await execute(command);
    }
}
