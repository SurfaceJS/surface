/* eslint-disable lines-around-comment */
import { readFile }                          from "fs/promises";
import path                                  from "path";
import { URL, fileURLToPath, pathToFileURL } from "url";
import { getExports, getMocksMaps }          from "./common.js";

type GetFormatResult  = { format: string };
type GetFormatContext = { format: string };
type GetSourceContext = { format: string };
type GetSourceResult  = { source: string };
type ResolveContext   = { conditions: string[], parentURL?: string };
type ResolveResult    = { url: string };
type LoadContext      = { format: string };
type LoadResult       = { format: string, source: string };

const MOCK     = "mock";
const PROXY    = "proxy";
const TARGET   = "target";
const MOCK_SET = new Set<string | null>(["", PROXY]);

const protocolPattern     = /^\w+?:/;
const relativePathPattern = /^\.?\.\//;
const paramsPattern       = /\?.*$/;
const proxyMap            = getMocksMaps();
const DIRNAME             = path.dirname(fileURLToPath(import.meta.url)) as ".";
const PROXY_PATH          = `${pathToFileURL(path.join(DIRNAME, PROXY)).toString()}/` as `${typeof DIRNAME}/${typeof PROXY}`;
const proxyFiles          = new Map<string, string>();
const parentProxyFiles    = new Map<string, string | undefined>();

function internalGetFormat(specifier: string): GetFormatResult | null
{
    /* c8 ignore start */
    if (specifier.startsWith(PROXY_PATH) || MOCK_SET.has(new URL(specifier).searchParams.get(MOCK)))
    {
        return { format: "module" };
    }
    else if (specifier.startsWith("file:") && !path.parse(fileURLToPath(specifier)).ext)
    {
        return { format: "commonjs" };
    }

    return null;
    /* c8 ignore stop */
}

async function internalGetSource(url: URL): Promise<GetSourceResult | null>
{
    if (MOCK_SET.has(url.searchParams.get(MOCK)))
    {
        url.searchParams.set(MOCK, TARGET);

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

    return null;
}

export async function resolve(specifier: string, context: ResolveContext, defaultResolve: (specifier: string, context: ResolveContext) => Promise<ResolveResult>): Promise<ResolveResult>
{
    let resolved = specifier;

    if (!protocolPattern.test(specifier))
    {
        const proxyContext   = { conditions: context.conditions, parentURL: parentProxyFiles.get(context.parentURL!) ?? context.parentURL };
        const isRelativePath = relativePathPattern.test(specifier);

        if (isRelativePath)
        {
            resolved = (await defaultResolve(specifier, proxyContext)).url;
        }
        else
        {
            const searchParams = paramsPattern.exec(specifier)?.[0] ?? "";

            resolved = (await defaultResolve(specifier.replace(paramsPattern, ""), proxyContext)).url + searchParams;
        }
    }

    // console.log(`- resolve: ${parentProxyFiles.get(context.parentURL!) ?? context.parentURL} --> ${specifier} -> ${resolved}`);

    const proxyFile = proxyFiles.get(resolved);

    if (proxyFile)
    {
        return { url: proxyFile };
    }

    const url = new URL(resolved);

    if (proxyMap.has(resolved) || specifier != resolved && proxyMap.has(specifier))
    {
        url.searchParams.set(MOCK, PROXY);

        resolved = url.href;
    }

    if (MOCK_SET.has(url.searchParams.get(MOCK)))
    {
        if (url.protocol == "node:")
        {
            resolved = url.href.replace(/^node(js)?:/, PROXY_PATH);

            parentProxyFiles.set(resolved, context.parentURL);
        }

        url.searchParams.delete(MOCK);

        proxyFiles.set(url.href, resolved);

        return { url: resolved };
    }

    url.searchParams.delete(MOCK);

    if (url.href.startsWith(PROXY_PATH))
    {
        return { url: url.href.replace(PROXY_PATH, "node:") };
    }

    return { url: url.href };
}

/* c8 ignore next 6 */
export async function getSource(specifier: string, context: GetSourceContext, defaultGetSource: (specifier: string, context: GetSourceContext) => Promise<GetSourceResult>): Promise<GetSourceResult>
{
    const url = new URL(specifier);

    return await internalGetSource(url) ?? defaultGetSource(url.href, context);
}

/* c8 ignore next 4 */
export async function getFormat(specifier: string, context: GetFormatContext, defaultGetFormat: (specifier: string, context: GetFormatContext) => Promise<GetFormatResult>): Promise<GetFormatResult>
{
    return internalGetFormat(specifier) ?? defaultGetFormat(specifier, context);
}

export async function load(specifier: string, context: LoadContext, defaultLoad: (specifier: string, context: LoadContext) => Promise<LoadResult>): Promise<LoadResult>
{
    // console.log(`- load: ${specifier}`);

    const source = (await internalGetSource(new URL(specifier)))?.source;

    if (source)
    {
        return { format: "module", source };
    }

    /* c8 ignore start */
    const format = internalGetFormat(specifier)?.format;

    if (format)
    {
        return { format, source: String(await readFile(new URL(specifier))) };
    }
    /* c8 ignore stop */

    return defaultLoad(specifier, context);
}