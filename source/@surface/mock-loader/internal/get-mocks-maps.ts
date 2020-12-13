import fs                from "fs";
import os                from "os";
import path              from "path";
import { pathToFileURL } from "url";

type MockMap = { modules: string[] };

export default function getMocksMaps(): Set<string>
{
    const dirname = process.cwd();
    const root    = path.parse(dirname).root;

    const mockMapPath = path.join(dirname, "mock-loader.config.json");

    const mockMap = fs.existsSync(mockMapPath) ? JSON.parse(fs.readFileSync(mockMapPath).toString()) as MockMap : { modules: [] };

    const pathsToMock: string[] = [];

    for (const module of mockMap.modules)
    {
        if (module.startsWith("."))
        {
            const modulePath = path.resolve(dirname, module);

            if (os.platform() == "win32")
            {
                pathsToMock.push(pathToFileURL(modulePath.replace(root, root.toUpperCase())).href);
                pathsToMock.push(pathToFileURL(modulePath.replace(root, root.toLowerCase())).href);
            }
            else
            {
                pathsToMock.push(pathToFileURL(modulePath.toString()).href);
            }
        }
        else
        {
            pathsToMock.push(module);
        }
    }

    return new Set(pathsToMock);
}