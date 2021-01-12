import fs                from "fs";
import path              from "path";
import { pathToFileURL } from "url";

type Configuration = { modules: string[] };

export default function getMocksMaps(): Set<string>
{
    const dirname = process.cwd();

    const configurationPath = path.join(dirname, "mock-loader.config.json");

    const configuration = fs.existsSync(configurationPath) ? JSON.parse(fs.readFileSync(configurationPath).toString()) as Configuration : { modules: [] };

    const paths = new Set<string>();

    for (const module of configuration.modules)
    {
        if (module.startsWith("."))
        {
            const modulePath = path.resolve(dirname, module);

            const root = path.parse(modulePath).root;

            paths.add(pathToFileURL(modulePath.replace(root, root.toUpperCase())).href);
            paths.add(pathToFileURL(modulePath.replace(root, root.toLowerCase())).href);
        }
        else
        {
            paths.add(module);
        }
    }

    return paths;
}