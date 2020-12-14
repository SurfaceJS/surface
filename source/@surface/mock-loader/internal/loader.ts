import path                                  from "path";
import { URL, fileURLToPath, pathToFileURL } from "url";
import getMocksMaps                          from "./get-mocks-maps.js";

type GetFormatResult  = { format: string };
type GetSourceContext = { format: string };
type GetSourceResult  = { source: string };
type ResolveContext   = { condition: string[], parentURL?: string };
type ResolveResult    = { url: string };

const proxyMap         = getMocksMaps();
const dirname          = path.dirname(fileURLToPath(import.meta.url));
const proxyNode        = `${pathToFileURL(path.join(dirname, "proxy")).toString()}/`;
const proxyFiles       = new Map<string, string>();
const parentProxyFiles = new Map<string, string | undefined>();

function getExports(module: object): string[]
{
    const moduleExports: string[] = [];

    for (const key of Object.keys(module))
    {
        moduleExports.push(key == "default" ? "export default proxy.default;" : `export const ${key} = proxy.${key};`);
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

    if (!proxyFiles.has(resolved) && (proxyMap.has(specifier) || proxyMap.has(resolved)))
    {
        url.searchParams.set("require", "proxy");

        resolved = url.href;
    }

    if (url.searchParams.get("require") == "proxy")
    {
        if (url.protocol == "node:")
        {
            resolved = url.href.replace(/^node:/, proxyNode);

            parentProxyFiles.set(resolved, context.parentURL);
        }

        url.searchParams.delete("require");

        proxyFiles.set(url.href, resolved);

        return { url: resolved };
    }

    const proxyFile = proxyFiles.get(resolved);

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

        const rawSpecifier = url.href;

        const module = await import(rawSpecifier);

        const exports = getExports(module);

        const source =
        [
            "import createProxy from \"@surface/mock-loader/internal/create-proxy.js\"",
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