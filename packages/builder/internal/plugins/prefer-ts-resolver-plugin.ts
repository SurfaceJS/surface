import { existsSync } from "fs";
import path           from "path";
import PathMatcher    from "@surface/path-matcher";
import type webpack   from "webpack";

type Resolver = webpack.Resolver;

interface ResolvePlugin
{
    apply(resolver: Resolver): void;
}

export default class PreferTsResolverPlugin implements ResolvePlugin
{
    private readonly matcher: PathMatcher | null;

    public constructor(patterns?: string[])
    {
        this.matcher = patterns ? new PathMatcher(patterns, { base: process.cwd() }) : null;
    }

    public apply(resolver: Resolver): void
    {
        resolver.hooks.result.tap
        (
            PreferTsResolverPlugin.name,
            request =>
            {
                if (typeof request.path == "string")
                {
                    const target = path.parse(request.path);

                    if (target.ext.toLowerCase() == ".js" && (this.matcher?.isMatch(request.path) ?? true))
                    {
                        const sibling = path.join(target.dir, `${target.name}.ts`);

                        if (existsSync(sibling))
                        {
                            request.path = sibling;
                        }
                    }
                }

                return request;
            },
        );
    }
}