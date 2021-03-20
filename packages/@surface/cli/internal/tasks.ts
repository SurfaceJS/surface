/* eslint-disable @typescript-eslint/consistent-type-imports */
import child_process                                               from "child_process";
import { copyFile, existsSync, readFile, readFileSync, writeFile } from "fs";
import path                                                        from "path";
import { fileURLToPath }                                           from "url";
import util                                                        from "util";
import { createPathAsync }                                         from "@surface/io";
import inquirer                                                    from "inquirer";
import os                                                          from "os";

type TemplateIndex = typeof import("./templates/index.json");
type Package = { author: string, name: string, dependencies: Record<string, string> };

const copyFileAsync  = util.promisify(copyFile);
const readFileAsync  = util.promisify(readFile);
const writeFileAsync = util.promisify(writeFile);
const execAsync      = util.promisify(child_process.exec);

const dirname = path.dirname(fileURLToPath(import.meta.url));

const templateIndex = JSON.parse(readFileSync(path.resolve(dirname, "./templates/index.json")).toString()) as TemplateIndex;

export default class Tasks
{
    private static async generate(template: string, name: string, output: string): Promise<void>
    {
        console.log("Copying files...");

        const entries = templateIndex[template as keyof TemplateIndex];

        for (const entry of entries)
        {
            const source = path.join(dirname, "./templates", entry.name);
            const target = path.join(output, entry.path);

            const folder = path.dirname(target);

            if (!existsSync(folder))
            {
                await createPathAsync(folder);
            }

            await copyFileAsync(source, target);
        }

        await Tasks.install(name, output);
    }

    private static async install(name: string, output: string): Promise<void>
    {
        const packagePath = path.join(output, "package.json");

        const $package = JSON.parse((await readFileAsync(packagePath)).toString()) as Package;

        $package.author = os.userInfo().username;
        $package.name   = name;

        await writeFileAsync(packagePath, JSON.stringify($package, null, 4));

        console.log("Installing dependencies...");

        const { stderr } = await execAsync(`cd ${output} && npm install`);

        if (stderr)
        {
            console.log(stderr);
        }

        console.log("Done!");
    }

    public static async new(): Promise<void>
    {
        const templateQuestion =
        {
            choices: Object.keys(templateIndex),
            name:    "template",
            type:    "list",
        };

        const templateAnswer = await inquirer.prompt([templateQuestion]) as { template: string };

        const nameQuestion =
        {
            default: templateAnswer.template,
            name:    "name",
        };

        const nameAnswer = await inquirer.prompt([nameQuestion]) as { name: string };

        const outputQuestion =
        {
            default: path.join(process.cwd(), encodeURIComponent(nameAnswer.name as string)),
            name:    "output",
        };

        const outputAnswer = await inquirer.prompt([outputQuestion]) as { output: string };

        const output = path.isAbsolute(outputAnswer.output)
            ? outputAnswer.output
            : path.join(process.cwd(), encodeURIComponent(outputAnswer.output as string));

        await Tasks.generate(templateAnswer.template, nameAnswer.name, output);
    }
}