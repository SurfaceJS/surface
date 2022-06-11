import fs              from "fs";
import path            from "path";
import { PathMatcher } from "@surface/io";
import type webpack    from "webpack";

type ResolverPluginInstance = Exclude<Exclude<webpack.ResolveOptions["plugins"], undefined>[number], "...">;
type Resolver               = Parameters<ResolverPluginInstance["apply"]>[0];

export default class PreferTsResolverPlugin implements ResolverPluginInstance
{
    private readonly matcher: PathMatcher | null;

    public constructor(patterns?: string[])
    {
        this.matcher = patterns ? new PathMatcher(patterns, process.cwd()) : null;
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

                    if (target.ext.toLowerCase() == ".js" && (this.matcher?.test(request.path) ?? true))
                    {
                        const sibling = path.join(target.dir, `${target.name}.ts`);

                        if (fs.existsSync(sibling))
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
