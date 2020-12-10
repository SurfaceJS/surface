/* eslint-disable @typescript-eslint/no-unused-vars */
import path                                  from "path";
import { URL, fileURLToPath, pathToFileURL } from "url";
import getExports                            from "./get-exports.js";

const dirname        = path.dirname(fileURLToPath(import.meta.url));
// const createProxyUrl = pathToFileURL(path.resolve(dirname, "./create-proxy.js"));
const proxyNode      = `${pathToFileURL(path.join(path.parse(dirname).root, "proxy-node")).toString()}/`;
const proxieFiles    = new Map<string, string>();

type Context =
{
    condition: string[],
    parentUrl: string | undefined,
};

export async function resolve(specifier: string, context: Context, defaultResolve: (specifier: string, context: Context, defaultResolve: Function) => Promise<{ url: string }>): Promise<{ url: string }>
{
    let resolved: string;
    try
    {
        resolved = specifier.startsWith(proxyNode)
            ? specifier
            : (await defaultResolve(specifier, context, defaultResolve)).url;
    }
    catch (error)
    {
        if (specifier.includes("?require=proxy"))
        {
            resolved = `${(await defaultResolve(specifier.replace("?require=proxy", ""), context, defaultResolve)).url}?require=proxy`;
        }
        else
        {
            throw error;
        }
    }

    const url = new URL(resolved);

    if (url.searchParams.get("require") == "proxy")
    {
        if (resolved.startsWith("node:"))
        {
            resolved = resolved.replace(/^node:/, proxyNode);
        }

        url.searchParams.delete("require");

        proxieFiles.set(url.toString(), resolved);

        return { url: resolved };
    }

    const proxyFile = proxieFiles.get(resolved);

    if (proxyFile && new URL(resolved).searchParams.get("require") != "raw")
    {
        return { url: proxyFile };
    }

    if (url.href.startsWith(proxyNode) && url.searchParams.get("require") == "raw")
    {
        url.searchParams.delete("require");
    }

    return { url: url.href.startsWith(proxyNode) ? url.href.replace(proxyNode, "node:") : url.href };
}

export async function getSource(specifier: string, context: { format: string }, defaultGetSource: (specifier: string, context: { format: string }, defaultResolve: Function) => Promise<{ source: string }>): Promise<{ source: string }>
{
    const url = new URL(specifier);

    if (url.searchParams.get("require") == "proxy")
    {
        url.searchParams.set("require", "raw");

        if (url.href.startsWith(proxyNode))
        {
            const rawSpecifier = url.href;

            const source =
            [
                "import { createProxy } from \"@surface/mock-loader\"",
                `import * as module from \"${rawSpecifier}\";`,
                "const proxy = createProxy(module);",
                "export default proxy;",
            ].join("\n");

            return { source };
        }

        const rawSpecifier = url.toString();

        const originalSource = (await defaultGetSource(rawSpecifier, context, defaultGetSource)).source.toString();

        const { esm, exports } = getExports(originalSource);

        const source =
        [
            "import { createProxy } from \"@surface/mock-loader\"",
            `import ${esm ? "* as module" : "module"} from \"${rawSpecifier}\";`,
            "const proxy = createProxy(module);",
            ...exports,
        ].join("\n");

        return { source };
    }
    else if (url.searchParams.get("require") == "raw")
    {
        url.searchParams.delete("require");

        return defaultGetSource(url.toString(), context, defaultGetSource);
    }

    return defaultGetSource(specifier, context, defaultGetSource);
}

export async function getFormat(specifier: string, context: object, defaultGetFormat: (specifier: string, context: object, defaultResolve: Function) => Promise<{ format: string }>): Promise<{ format: string }>
{
    if (specifier.startsWith(proxyNode) || new URL(specifier).searchParams.get("require") == "proxy")
    {
        return { format: "module" };
    }
    else if (specifier.startsWith("file:") && !path.parse(fileURLToPath(specifier)).ext)
    {
        return { format: "commonjs" };
    }

    return defaultGetFormat(specifier, context, defaultGetFormat);
}