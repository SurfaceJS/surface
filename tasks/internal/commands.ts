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
        const content = (await readFile(TSCONFIG_PATH)).toString();

        try
        {
            logger.trace("Cleaning...");

            await execute(`${TSC} --build "${TSCONFIG_PATH}" --clean`);

            logger.info("Cleaning done!");

            const tsconfig = JSON5.parse(content) as TsConfig;

            tsconfig.compilerOptions = { ...tsconfig.compilerOptions, sourceMap: false };

            await writeFile(TSCONFIG_PATH, JSON.stringify(tsconfig, null, 4));

            logger.trace("Building...");
            await execute(`${TSC} --build "${TSCONFIG_PATH}"`);

            logger.info("Building modules done!");
        }
        finally
        {
            await writeFile(TSCONFIG_PATH, content);
        }
    }

    public static async cover(filepath: string): Promise<void>
    {
        const bin      = path.resolve(DIRNAME, "../../node_modules/.bin");
        const c8       = path.join(bin, "c8");
        const polyfill = path.join(process.cwd(), "tasks/polyfill.js");

        const file    = path.parse(filepath);
        const spec    = `${path.relative(process.cwd(), path.join(file.dir, file.name.replace(/((?:\.[-a-zA-Z0-9]+)*\.(?:scn))/, ".spec")))}.js`;
        console.log(spec);
        const target  = file.name.replace(/((?:\.[-a-zA-Z0-9]+)*\.(?:scn|spec))/, "");
        const include = `**/packages/**/${target}`;

        const command = `${c8} --text-exclude --include=${include}.js --include=${include}.ts --exclude=**/tests --exclude=**/node_modules --extension=.js --extension=.ts --reporter=text node --experimental-test-module-mocks --test --require=${polyfill} ${spec}`;

        logger.info(`cover ${chalk.bold.blue(target)} tests`);

        await execute(command);
    }

    public static async test(filepath: string): Promise<void>
    {
        const polyfill = path.join(process.cwd(), "tasks/polyfill.js");
        const file     = path.parse(filepath);
        const spec     = `${path.relative(process.cwd(), path.join(file.dir, file.name.replace(/((?:\.[-a-zA-Z0-9]+)*\.(?:scn))/, ".spec")))}.js`;

        const command = `node --experimental-test-module-mocks --test --require=${polyfill} ${spec}`;

        logger.info(`test ${chalk.bold.blue(filepath)}`);

        await execute(command);
    }
}
