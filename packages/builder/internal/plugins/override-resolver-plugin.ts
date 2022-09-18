import type webpack from "webpack";

type ResolverPluginInstance = Exclude<Exclude<webpack.ResolveOptions["plugins"], undefined>[number], "...">;
type Resolver               = Parameters<ResolverPluginInstance["apply"]>[0];

export type FileOverride = { replace: string, with: string };

export default class OverrideResolvePlugin implements ResolverPluginInstance
{
    private readonly overrides: Map<string, string>;

    public constructor(overrides: FileOverride[])
    {
        this.overrides = new Map(overrides.map(x => [x.replace, x.with]));
    }

    public apply(resolver: Resolver): void
    {
        resolver.hooks.result.tap
        (
            OverrideResolvePlugin.name,
            (request) =>
            {
                if (typeof request.path == "string")
                {
                    request.path = this.overrides.get(request.path) ?? request.path;
                }

                return request;
            },
        );
    }
}