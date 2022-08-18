/* eslint-disable lines-around-comment */
import path                                     from "path";
import { URL, fileURLToPath, pathToFileURL }    from "url";
import { IS_WINDOWS, getExports, getMocksMaps } from "./common.js";

type ResolveContext = { conditions: string[], parentURL?: string };
type ResolveResult  = { url: string, shortCircuit?: boolean };
type LoadContext    = { format: string };
type LoadResult     = { format: string, source: string, shortCircuit?: boolean };

const MOCK       = "mock";
const PROXY      = "proxy";
const TARGET     = "target";
const MOCK_SET   = new Set<string | null>(["", PROXY]);

const protocolPattern     = /^\w+?:/;
const relativePathPattern = /^\.?\.\//;
const paramsPattern       = /\?.*$/;
const proxyMap            = getMocksMaps();
const DIRNAME             = path.dirname(fileURLToPath(import.meta.url)) as ".";
const PROXY_PATH          = `${pathToFileURL(path.join(DIRNAME, PROXY)).toString()}/` as `${typeof DIRNAME}/${typeof PROXY}`;
const proxyFiles          = new Map<string, string>();
const parentProxyFiles    = new Map<string, string | undefined>();
const cache               = new Map<string, string>();

export async function resolve(specifier: string, context: ResolveContext, next: (specifier: string, context: ResolveContext) => Promise<ResolveResult>): Promise<ResolveResult>
{
    let resolved = specifier;

    if (!protocolPattern.test(specifier))
    {
        const proxyContext   = { conditions: context.conditions, parentURL: parentProxyFiles.get(context.parentURL!) ?? context.parentURL };
        const isRelativePath = relativePathPattern.test(specifier);

        if (isRelativePath)
        {
            resolved = (await next(specifier, proxyContext)).url;
        }
        else
        {
            const searchParams = paramsPattern.exec(specifier)?.[0] ?? "";

            resolved = (await next(specifier.replace(paramsPattern, ""), proxyContext)).url + searchParams;
        }
    }

    /* c8 ignore start */
    if (IS_WINDOWS)
    {
        const key = resolved.toLowerCase();

        const entry = cache.get(key);

        if (!entry)
        {
            cache.set(key, resolved);
        }
        else
        {
            resolved = entry;
        }
    }
    /* c8 ignore end */

    const proxyFile = proxyFiles.get(resolved);

    if (proxyFile)
    {
        return { url: proxyFile, shortCircuit: true };
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

        return { url: resolved, shortCircuit: true };
    }

    url.searchParams.delete(MOCK);

    if (url.href.startsWith(PROXY_PATH))
    {
        return { url: url.href.replace(PROXY_PATH, "node:"), shortCircuit: true };
    }

    return { url: url.href, shortCircuit: true };
}

export async function load(specifier: string, context: LoadContext, next: (specifier: string, context: LoadContext) => Promise<LoadResult>): Promise<LoadResult>
{
    const url = new URL(specifier);

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

        return { format: "module", source, shortCircuit: true };
    }

    return next(specifier, context);
}
