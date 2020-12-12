import path                                  from "path";
import { URL, fileURLToPath, pathToFileURL } from "url";

const dirname          = path.dirname(fileURLToPath(import.meta.url));
const proxyNode        = `${pathToFileURL(path.join(dirname, "proxy")).toString()}/`;
const proxieFiles      = new Map<string, string>();
const parentProxyFiles = new Map<string, string | undefined>();

type GetFormatResult  = { format: string };
type GetSourceContext = { format: string };
type GetSourceResult  = { source: string };
type ResolveContext   = { condition: string[], parentURL?: string };
type ResolveResult    = { url: string };

function getExports(module: object): string[]
{
    const moduleExports: string[] = [];

    for (const key of Object.keys(module))
    {
        moduleExports.push(key == "default" ? "export default proxy.default" : `export let ${key} = proxy.${key}`);
    }

    return moduleExports;
}

export async function resolve(specifier: string, context: ResolveContext, defaultResolve: (specifier: string, context: ResolveContext, defaultResolve: Function) => Promise<ResolveResult>): Promise<ResolveResult>
{
    let resolved: string;
    const proxyContext = { condition: context.condition, parentURL: parentProxyFiles.get(context.parentURL!) ?? context.parentURL };
    try
    {
        resolved = specifier.startsWith(proxyNode)
            ? specifier
            : (await defaultResolve(specifier, proxyContext, defaultResolve)).url;
    }
    catch (error)
    {
        if (specifier.includes("?require=proxy"))
        {
            resolved = `${(await defaultResolve(specifier.replace("?require=proxy", ""), proxyContext, defaultResolve)).url}?require=proxy`;
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
            parentProxyFiles.set(resolved, context.parentURL);
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

export async function getSource(specifier: string, context: GetSourceContext, defaultGetSource: (specifier: string, context: GetSourceContext, defaultResolve: Function) => Promise<GetSourceResult>): Promise<GetSourceResult>
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

        const rawSpecifier = url.href;

        const module = await import(rawSpecifier);

        const exports = getExports(module);

        const source =
        [
            "import { createProxy } from \"@surface/mock-loader\"",
            `import * as module from \"${rawSpecifier}\";`,
            "const proxy = createProxy(module);",
            ...exports,
        ].join("\n");

        return { source };
    }
    else if (url.searchParams.get("require") == "raw")
    {
        url.searchParams.delete("require");

        return defaultGetSource(url.href, context, defaultGetSource);
    }

    return defaultGetSource(specifier, context, defaultGetSource);
}

export async function getFormat(specifier: string, context: object, defaultGetFormat: (specifier: string, context: object, defaultResolve: Function) => Promise<GetFormatResult>): Promise<{ format: string }>
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