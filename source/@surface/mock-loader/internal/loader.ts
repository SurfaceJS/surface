import path                                  from "path";
import { URL, fileURLToPath, pathToFileURL } from "url";
import getMocksMaps                          from "./get-mocks-maps.js";

type GetFormatResult  = { format: string };
type GetSourceContext = { format: string };
type GetSourceResult  = { source: string };
type ResolveContext   = { condition: string[], parentURL?: string };
type ResolveResult    = { url: string };

const MOCK_MODULE = "mock-module";
const PROXY       = "proxy";
const TARGET      = "target";

const protocolPattern     = /^\w+?:/;
const relativePathPattern = /^\.?\.\//;
const proxyMap            = getMocksMaps();
const dirname             = path.dirname(fileURLToPath(import.meta.url));
const proxyNode           = `${pathToFileURL(path.join(dirname, PROXY)).toString()}/`;
const proxyFiles          = new Map<string, string>();
const parentProxyFiles    = new Map<string, string | undefined>();

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
    let resolved = specifier;

    if (!protocolPattern.test(specifier))
    {
        const proxyContext   = { condition: context.condition, parentURL: parentProxyFiles.get(context.parentURL!) ?? context.parentURL };
        const isRelativePath = relativePathPattern.test(specifier);

        if (isRelativePath)
        {
            resolved = (await defaultResolve(specifier, proxyContext, defaultResolve)).url;
        }
        else
        {
            const proxyHint  = `?${MOCK_MODULE}=${PROXY}`;
            const targetHint = `?${MOCK_MODULE}=${TARGET}`;

            const searchParams = specifier.includes(proxyHint)
                ? proxyHint
                : specifier.includes(targetHint)
                    ? targetHint
                    : "";

            resolved = (await defaultResolve(specifier.replace(proxyHint, "").replace(targetHint, ""), proxyContext, defaultResolve)).url + searchParams;
        }
    }

    const proxyFile = proxyFiles.get(resolved);

    if (proxyFile)
    {
        return { url: proxyFile };
    }

    const url = new URL(resolved);

    if (proxyMap.has(specifier) || proxyMap.has(resolved))
    {
        url.searchParams.set(MOCK_MODULE, PROXY);

        resolved = url.href;
    }

    if (url.searchParams.get(MOCK_MODULE) == PROXY)
    {
        if (url.protocol == "node:")
        {
            resolved = url.href.replace(/^node(js)?:/, proxyNode);

            parentProxyFiles.set(resolved, context.parentURL);
        }

        url.searchParams.delete(MOCK_MODULE);

        proxyFiles.set(url.href, resolved);

        return { url: resolved };
    }

    url.searchParams.delete(MOCK_MODULE);

    if (url.href.startsWith(proxyNode))
    {
        return { url: url.href.replace(proxyNode, "node:") };
    }

    return { url: url.href };
}

export async function getSource(specifier: string, context: GetSourceContext, defaultGetSource: (specifier: string, context: GetSourceContext, defaultGetSource: Function) => Promise<GetSourceResult>): Promise<GetSourceResult>
{
    const url = new URL(specifier);

    if (url.searchParams.get(MOCK_MODULE) == PROXY)
    {
        url.searchParams.set(MOCK_MODULE, TARGET);

        const targetSpecifier = url.href;

        const module = await import(targetSpecifier);

        const exports = getExports(module);

        const source =
        [
            "import createProxy from \"@surface/mock-loader/internal/create-proxy.js\"",
            `import * as module from \"${targetSpecifier}\";`,
            "const proxy = createProxy(module);",
            ...exports,
        ].join("\n");

        return { source };
    }

    return defaultGetSource(url.href, context, defaultGetSource);
}

export async function getFormat(specifier: string, context: object, defaultGetFormat: (specifier: string, context: object, defaultGetFormat: Function) => Promise<GetFormatResult>): Promise<{ format: string }>
{
    if (specifier.startsWith(proxyNode) || new URL(specifier).searchParams.get(MOCK_MODULE) == PROXY)
    {
        return { format: "module" };
    } /* c8 ignore next 4 */
    else if (specifier.startsWith("file:") && !path.parse(fileURLToPath(specifier)).ext)
    {
        return { format: "commonjs" };
    }

    return defaultGetFormat(specifier, context, defaultGetFormat);
}