import SrcSetParser from "./srcset-parser.js";

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
function metaContentResolver(tag: string, name: string, value: string): string
{
    const isMsapplicationTask = name == "name" && value == "msapplication-task";

    if (isMsapplicationTask)
    {
        if (name.toLowerCase() == "icon-uri")
        {
            return srcResolver(tag, name, value);
        }

        if (!value)
        {
            return "";
        }

        return value;
    }

    return srcResolver(tag, name, value);
}

function srcResolver(_tag: string, _name: string, value: string): string
{
    return `\`${`\${new Url("${value}")}`}\``;
}

function srcsetResolver(_tag: string, _name: string, value: string): string
{
    return `\`${SrcSetParser.stringify(SrcSetParser.parse(value).map(x => ({ ...x, url: `\${new Url("${x.url}")}` })))}\``;
}
// #endregion Types

// #region Filters
function linkItempropFilter(_tag: string, _attribute: string, attributes: Map<string, string>): boolean
{
    let name = attributes.get("rel");

    if (name)
    {
        name = name.trim();

        if (!name)
        {
            return false;
        }

        name = name.toLowerCase();

        return META_TAG.itemprop.has(name);
    }

    return false;
}

function linkHrefFilter(_tag: string, _attribute: string, attributes: Map<string, string>): boolean
{
    let rel = attributes.get("rel");

    if (!rel)
    {
        return false;
    }

    rel = rel.trim();

    if (!rel)
    {
        return false;
    }

    rel = rel.toLowerCase();

    const usedRels = rel.split(" ").filter((value) => value);
    const allowedRels = [
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

    return allowedRels.filter((value) => usedRels.includes(value)).length > 0;
}

function linkUnionFilter(tag: string, attribute: string, attributes: Map<string, string>): boolean
{
    return linkHrefFilter(tag, attribute, attributes) || linkItempropFilter(tag, attribute, attributes);
}

function metaContentFilter(_tag: string, _attribute: string, attributes: Map<string, string>): boolean
{
    for (const item of Object.entries(META_TAG))
    {
        const [key, allowedNames] = item;

        let name = attributes.get(key);

        if (name)
        {
            name = name.trim();

            if (!name)
            {
                continue;
            }

            name = name.toLowerCase();

            return allowedNames.has(name);
        }
    }

    return false;
}

function scriptSrcFilter(_tag: string, _attribute: string, attributes: Map<string, string>): boolean
{
    let type = attributes.get("type");

    if (!type)
    {
        return true;
    }

    type = type.trim();

    if (!type)
    {
        return false;
    }

    if (type != "module" && type != "text/javascript" && type != "application/javascript")
    {
        return false;
    }

    return true;
}
// #endregion Filters

const sources: Record<string, Record<string, ElementResolver>> =
{
    "audio":
    {
        "src":
        {
            resolver: srcResolver,
        },
    },
    "embed":
    {
        "src":
        {
            resolver: srcResolver,
        },
    },
    "image":
    {
        "href":
        {
            resolver: srcResolver,
        },
        "xlink:href":
        {
            resolver: srcResolver,
        },
    },
    "img":
    {
        "src":
        {
            resolver: srcResolver,
        },
        "srcset":
        {
            resolver: srcsetResolver,
        },
    },
    "input":
    {
        "src":
        {
            resolver: srcResolver,
        },
    },
    "link":
    {
        "href":
        {
            filter:   linkUnionFilter,
            resolver: srcResolver,
        },
        "imagesrcset":
        {
            filter:   linkHrefFilter,
            resolver: srcsetResolver,
        },
    },
    "meta":
    {
        "content":
        {
            filter:   metaContentFilter,
            resolver: metaContentResolver,
        },
    },
    "object":
    {
        "data":
        {
            resolver: srcResolver,
        },
    },
    "script":
    {
        "href":
        {
            filter:   scriptSrcFilter,
            resolver: srcResolver,
        },
        "src":
        {
            filter:   scriptSrcFilter,
            resolver: srcResolver,
        },
        "xlink:href":
        {
            filter:   scriptSrcFilter,
            resolver: srcResolver,
        },
    },
    "source":
    {
        "src":
        {
            resolver: srcResolver,
        },
        "srcset":
        {
            resolver: srcsetResolver,
        },
    },
    "track":
    {
        "src":
        {
            resolver: srcResolver,
        },
    },
    "use":
    {
        "href":
        {
            resolver: srcResolver,
        },
        "xlink:href":
        {
            resolver: srcResolver,
        },
    },
    "video":
    {
        "poster":
        {
            resolver: srcResolver,
        },
        "src":
        {
            resolver: srcResolver,
        },
    },
};

export type ElementResolver = { resolver: Resolver, filter?: Filter };
export type Filter          = (tag: string, attribute: string, attributes: Map<string, string>) => boolean;
export type Resolver        = (tag: string, name: string, value: string) => string;

export default sources;