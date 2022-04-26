/* eslint-disable lines-around-comment */
import fs                from "fs";
import os                from "os";
import path              from "path";
import { pathToFileURL } from "url";

type Configuration = { modules: string[] };

export const IS_WINDOWS = os.platform() == "win32";

export function getExports(module: object): string[]
{
    const moduleExports: string[] = [];

    for (const key of Object.keys(module))
    {
        moduleExports.push(key == "default" ? "export default proxy.default;" : `export const ${key} = proxy.${key};`);
    }

    return moduleExports;
}

export function getMocksMaps(): Set<string>
{
    const DIRNAME = process.cwd();

    const configurationPath = path.join(DIRNAME, "mock-loader.config.json");

    const configuration = fs.existsSync(configurationPath) ? JSON.parse(fs.readFileSync(configurationPath).toString()) as Configuration : { modules: [] };

    const paths = new Set<string>();

    for (const module of configuration.modules)
    {
        if (module.startsWith("."))
        {
            const modulePath = path.resolve(DIRNAME, module);

            /* c8 ignore start */
            if (IS_WINDOWS)
            {
                const root = path.parse(modulePath).root;

                paths.add(pathToFileURL(modulePath.replace(root, root.toUpperCase())).href);
                paths.add(pathToFileURL(modulePath.replace(root, root.toLowerCase())).href);
            }
            else
            {
                paths.add(pathToFileURL(modulePath).href);
            }
            /* c8 ignore stop */
        }
        else
        {
            paths.add(module);
        }
    }

    return paths;
}