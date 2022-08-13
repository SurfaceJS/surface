/* eslint-disable max-len */
import child_process           from "child_process";
import { readFile, writeFile } from "fs/promises";
import path                    from "path";
import { fileURLToPath }       from "url";
import Logger, { LogLevel }    from "@surface/logger";
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

export async function execute(command: string, color: boolean = false): Promise<void>
{
    await new Promise<void>
    (
        (resolve, reject) =>
        {
            const childProcess = child_process.exec(`${command}${color ? " --color" : ""}`);

            childProcess.stdout?.on("data", x => console.log(String(x).trimEnd()));
            childProcess.stderr?.on("data", x => console.log(String(x).trimEnd()));

            childProcess.on("error", x => (console.log(String(x)), reject));
            childProcess.on("exit", resolve);
        },
    );
}

export default class Commands
{
    public static async buildRelease(): Promise<void>
    {
        logger.trace("Cleaning...");

        await execute(`${TSC} --build "${TSCONFIG_PATH}" --clean`);

        logger.info("Cleaning done!");

        const content = (await readFile(TSCONFIG_PATH)).toString();

        const tsconfig = JSON5.parse(content) as TsConfig;

        tsconfig.compilerOptions.sourceMap = false;

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

        const file   = path.parse(filepath);
        const spec   = `${path.relative(process.cwd(), path.join(file.dir, file.name.replace(/((?:\.[-a-zA-Z0-9]+)*\.(?:scn))/, ".spec")))}.js`;
        const target = file.name.replace(/((?:\.\w+)*\.(?:scn|spec))/, "");

        const command = `${c8} --text-exclude --include=**/@surface/**/${target}.js --include=**/@surface/**/${target}.ts --exclude=**/tests --exclude=**/node_modules --extension=.js --extension=.ts --reporter=text ${mocha} --loader=@surface/mock-loader --reporter=progress ${spec}`;

        logger.info(`cover ${chalk.bold.blue(target)} tests`);

        await execute(command, true);
    }

    public static async test(filepath: string): Promise<void>
    {
        const bin   = path.resolve(DIRNAME, "../../node_modules/.bin");
        const mocha = path.join(bin, "mocha");
        const file  = path.parse(filepath);
        const spec  = `${path.relative(process.cwd(), path.join(file.dir, file.name.replace(/((?:\.[-a-zA-Z0-9]+)*\.(?:scn))/, ".spec")))}.js`;

        const command = `${mocha} --loader=@surface/mock-loader ${spec}`;

        logger.info(`test ${chalk.bold.blue(filepath)}`);

        await execute(command, true);
    }
}
