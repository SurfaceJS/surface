import fs                    from "fs";
import path                  from "path";
import { createPathMatcher } from "@surface/io";
import type webpack          from "webpack";

type ResolverPluginInstance = Exclude<Exclude<webpack.ResolveOptions["plugins"], undefined>[number], "...">;
type Resolver               = Parameters<ResolverPluginInstance["apply"]>[0];

export default class PreferTsResolverPlugin implements ResolverPluginInstance
{
    private readonly patterns: RegExp | null;

    public constructor(patterns?: string[])
    {
        const cwd = process.cwd();

        this.patterns = patterns ? createPathMatcher(...patterns.map(x => path.resolve(cwd, x))) : null;
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

                    if (target.ext.toLowerCase() == ".js" && (this.patterns?.test(request.path) ?? true))
                    {
                        const simbling = path.join(target.dir, `${target.name}.ts`);

                        if (fs.existsSync(simbling))
                        {
                            request.path = simbling;
                        }
                    }
                }

                return request;
            },
        );
    }
}