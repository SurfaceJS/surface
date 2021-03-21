/* eslint-disable @typescript-eslint/consistent-type-imports */
import child_process                                               from "child_process";
import { copyFile, existsSync, readFile, readFileSync, writeFile } from "fs";
import os                                                          from "os";
import path                                                        from "path";
import { fileURLToPath }                                           from "url";
import util                                                        from "util";
import { createPathAsync }                                         from "@surface/io";
import inquirer, { QuestionCollection }                            from "inquirer";

type TemplateIndex = typeof import("./templates/index.json");
type Package = { author: string, name: string };

const copyFileAsync  = util.promisify(copyFile);
const readFileAsync  = util.promisify(readFile);
const writeFileAsync = util.promisify(writeFile);
const execAsync      = util.promisify(child_process.exec);

const dirname = path.dirname(fileURLToPath(import.meta.url));

const templateIndex = JSON.parse(readFileSync(path.resolve(dirname, "./templates/index.json")).toString()) as TemplateIndex;

const periodPattern      = /\.$/;
const windowsPathPattern = /^((((\w\:)?[\\\/])|((\.[\\\/])?(\.\.[\\\/])*))([^\\\/:*?"<>|]+[\\\/]?)*)$/;
const linuxPathPattern   = /^((((\.[\/])?(\.\.[\/])*)|\/)([^\/]+[\/]?)*)$/;

export default class Tasks
{
    private static async generate(template: keyof TemplateIndex, name: string, output: string): Promise<void>
    {
        console.log("Generating files...");

        const entry = templateIndex[template];

        for (const file of entry.files)
        {
            const source = path.join(dirname, "./templates", file.name);
            const target = path.join(output, file.path);

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

        console.log(`Done! Open "${output}" and happy coding 😃`);
    }

    public static async new(): Promise<void>
    {
        const transformerName = (x: string): string => x.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "")
            .toLocaleLowerCase();

        const choices = Object.entries(templateIndex)
            .map(([key, value]) => ({ name: value.description.replace(periodPattern, ""), value: key }));

        const templateQuestion: QuestionCollection<{ template: keyof TemplateIndex }> =
        {
            choices,
            message: "Choose a template:",
            name:    "template",
            type:    "list",
        };

        const template = (await inquirer.prompt([templateQuestion])).template;

        const nameQuestion: QuestionCollection<{ name: string }> =
        {
            default:     transformerName(templateIndex[template].description.replace(periodPattern, "")),
            message:     "Name:",
            name:        "name",
            transformer: transformerName,
        };

        const name = transformerName((await inquirer.prompt([nameQuestion])).name);

        const outputQuestion: QuestionCollection<{ output: string }> =
        {
            default:  path.join(process.cwd(), name),
            message:  "Output:",
            name:     "output",
            validate: (value: string) => process.platform == "win32" ? windowsPathPattern.test(value) : linuxPathPattern.test(value),
        };

        const outputAnswer = await inquirer.prompt([outputQuestion]);

        const output = path.isAbsolute(outputAnswer.output)
            ? outputAnswer.output
            : path.join(process.cwd(), outputAnswer.output);

        await Tasks.generate(template, name, output);
    }
}