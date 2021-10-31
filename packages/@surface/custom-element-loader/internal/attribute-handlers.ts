import SrcSetParser              from "./srcset-parser.js";
import type { AttributeHandler, AttributeHandlers, AttributeResolver, ElementAttributeHandlers } from "./types";

const META_TAG =
{
    "itemprop": new Set
    ([
        "image",
        "logo",
        "screenshot",
        "thumbnailurl",
        "contenturl",
        "downloadurl",
        "duringmedia",
        "embedurl",
        "installurl",
        "layoutimage",
    ]),
    "name": new Set
    ([
        // msapplication-TileImage
        "msapplication-tileimage",
        "msapplication-square70x70logo",
        "msapplication-square150x150logo",
        "msapplication-wide310x150logo",
        "msapplication-square310x310logo",
        "msapplication-config",
        "msapplication-task",
        "twitter:image",
    ]),
    "property": new Set
    ([
        "og:image",
        "og:image:url",
        "og:image:secure_url",
        "og:audio",
        "og:audio:secure_url",
        "og:video",
        "og:video:secure_url",
        "vk:image",
    ]),
};

// #region Resolvers
function metaContentResolver(name: string, value: string, attributes: Map<string, string>): string
{
    const isMsapplicationTask = attributes.get("name") == "msapplication-task";

    if (isMsapplicationTask)
    {
        const parts = value ? value.split(";") : [];

        for (const [index, part] of parts.entries())
        {
            if (part.trim().startsWith("icon-uri"))
            {
                const [name, src] = part.split("=");

                parts[index] = `${name}=\${new URL("${src}", import.meta.url)}`;
            }
        }

        return parts.length > 0 ? `\`${parts.join(";")}\`` : "\"\"";
    }

    return srcResolver(name, value);
}

function srcResolver(_name: string, value: string): string
{
    return `\`${`\${new URL("${value}", import.meta.url)}`}\``;
}

function srcsetResolver(_name: string, value: string): string
{
    return `\`${SrcSetParser.stringify(SrcSetParser.parse(value).map(x => ({ ...x, url: `\${new URL("${x.url}", import.meta.url)}` })))}\``;
}
// #endregion Types

// #region Filters
function linkItempropFilter(_name: string, _value: string, attributes: Map<string, string>): boolean
{
    const itemprop = attributes.get("itemprop")?.trim().toLowerCase();

    if (itemprop)
    {
        return META_TAG.itemprop.has(itemprop);
    }

    return false;
}

function linkHrefFilter(_name: string, _value: string, attributes: Map<string, string>): boolean
{
    const rel = attributes.get("rel")?.trim().toLowerCase();

    if (!rel)
    {
        return false;
    }

    const usedRels = rel.split(" ").filter(x => x);
    const allowedRels =
    [
        "stylesheet",
        "icon",
        "mask-icon",
        "apple-touch-icon",
        "apple-touch-icon-precomposed",
        "apple-touch-startup-image",
        "manifest",
        "prefetch",
        "preload",
    ];

    return allowedRels.filter(x => usedRels.includes(x)).length > 0;
}

function linkUnionFilter(name: string, value: string, attributes: Map<string, string>): boolean
{
    return linkHrefFilter(name, value, attributes) || linkItempropFilter(name, value, attributes);
}

function metaContentFilter(_name: string, _value: string, attributes: Map<string, string>): boolean
{
    for (const item of Object.entries(META_TAG))
    {
        const [key, allowedNames] = item;

        const name = attributes.get(key)?.trim().toLocaleLowerCase();

        if (name)
        {
            return allowedNames.has(name);
        }
    }

    return false;
}

function scriptSrcFilter(_name: string, _value: string, attributes: Map<string, string>): boolean
{
    const type = attributes.get("type")?.trim().toLowerCase();

    return type == "module" || type == "text/javascript" || type == "application/javascript";
}
// #endregion Filters

const resolvers: Record<string, AttributeResolver> =
{
    "src":    srcResolver,
    "srcset": srcsetResolver,
};

export function mapHandlers(entries: ElementAttributeHandlers[]): AttributeHandlers
{
    const handlers: AttributeHandlers = { };

    for (const entry of entries)
    {
        const handler = handlers[entry.tag] ?? (handlers[entry.tag] = { });

        handler[entry.attribute] = { filter: entry.filter, resolve: entry.resolve ?? resolvers[entry.type] };
    }

    return handlers;
}

export const defaultAttributeHandlers: Record<string, Record<string, AttributeHandler>> =
{
    "audio":
    {
        "src":
        {
            resolve: srcResolver,
        },
    },
    "embed":
    {
        "src":
        {
            resolve: srcResolver,
        },
    },
    "image":
    {
        "href":
        {
            resolve: srcResolver,
        },
        "xlink:href":
        {
            resolve: srcResolver,
        },
    },
    "img":
    {
        "src":
        {
            resolve: srcResolver,
        },
        "srcset":
        {
            resolve: srcsetResolver,
        },
    },
    "input":
    {
        "src":
        {
            resolve: srcResolver,
        },
    },
    "link":
    {
        "href":
        {
            filter:  linkUnionFilter,
            resolve: srcResolver,
        },
        "imagesrcset":
        {
            filter:  linkHrefFilter,
            resolve: srcsetResolver,
        },
    },
    "meta":
    {
        "content":
        {
            filter:  metaContentFilter,
            resolve: metaContentResolver,
        },
    },
    "object":
    {
        "data":
        {
            resolve: srcResolver,
        },
    },
    "script":
    {
        "href":
        {
            filter:  scriptSrcFilter,
            resolve: srcResolver,
        },
        "src":
        {
            filter:  scriptSrcFilter,
            resolve: srcResolver,
        },
        "xlink:href":
        {
            filter:  scriptSrcFilter,
            resolve: srcResolver,
        },
    },
    "source":
    {
        "src":
        {
            resolve: srcResolver,
        },
        "srcset":
        {
            resolve: srcsetResolver,
        },
    },
    "track":
    {
        "src":
        {
            resolve: srcResolver,
        },
    },
    "use":
    {
        "href":
        {
            resolve: srcResolver,
        },
        "xlink:href":
        {
            resolve: srcResolver,
        },
    },
    "video":
    {
        "poster":
        {
            resolve: srcResolver,
        },
        "src":
        {
            resolve: srcResolver,
        },
    },
};