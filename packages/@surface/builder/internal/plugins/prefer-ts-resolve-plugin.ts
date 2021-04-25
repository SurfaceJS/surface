import fs                    from "fs";
import path                  from "path";
import { createPathMatcher } from "@surface/io";
import type webpack          from "webpack";

type ResolverPluginInstance = Exclude<Exclude<webpack.ResolveOptions["plugins"], undefined>[number], "...">;
type Resolver               = Parameters<ResolverPluginInstance["apply"]>[0];

export default class PreferTsResolvePlugin implements ResolverPluginInstance
{
    private readonly patterns: RegExp;

    public constructor(patterns: string[] = [])
    {
        this.patterns = patterns.length == 0 ? /.*/ : createPathMatcher(...patterns);
    }

    public apply(resolver: Resolver): void
    {
        resolver.hooks.result.tap
        (
            PreferTsResolvePlugin.name,
            request =>
            {
                if (typeof request.path == "string")
                {
                    const target = path.parse(request.path);

                    if (target.ext.toLowerCase() == ".js" && this.patterns.test(request.path))
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