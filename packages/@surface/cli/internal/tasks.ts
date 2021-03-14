import { readFileSync }  from "fs";
import path              from "path";
import { fileURLToPath } from "url";
import inquirer          from "inquirer";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default class Tasks
{
    public static async new(): Promise<void>
    {
        const index = JSON.parse(readFileSync(path.resolve(dirname, "./templates/index.json")).toString());

        const templateQuestion =
        {
            choices: Object.keys(index),
            name:    "template",
            type:    "list",
        };

        const templateAnswer = await inquirer.prompt([templateQuestion]);

        const nameQuestion =
        {
            default: templateAnswer.template,
            name:    "name",
        };

        const nameAnswer = await inquirer.prompt([nameQuestion]);

        const outputQuestion =
        {
            default: path.relative(process.cwd(), encodeURIComponent(nameAnswer.name as string)),
            name:    "output",
        };

        const outputAnswer = await inquirer.prompt([outputQuestion]);

        console.log(templateAnswer, outputAnswer);
    }
}