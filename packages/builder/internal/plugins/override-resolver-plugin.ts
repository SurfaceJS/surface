import type webpack from "webpack";

type Resolver = webpack.Resolver;

interface IResolvePlugin
{
    apply(resolver: Resolver): void;
}

export default class OverrideResolvePlugin implements IResolvePlugin
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

export type FileOverride = { replace: string, with: string };