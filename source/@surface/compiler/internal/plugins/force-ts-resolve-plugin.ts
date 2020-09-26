import path              from "path";
import { ResolvePlugin } from "webpack";
import { fs }            from "../external";

export default class ForceTsResolvePlugin implements ResolvePlugin
{
    public constructor(private readonly paths: string[] = [])
    { }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public apply(resolver: any): void
    {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;

        resolver.hooks.resolved.tap
        (
            ForceTsResolvePlugin.name,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (request: any) =>
            {
                const target    = request.path;
                const extension = path.parse(target).ext;

                if (extension.toLowerCase() == ".js" && (self.paths.length == 0 || self.paths.some(x => target.toLowerCase().startsWith(x.toLowerCase()))))
                {
                    const simbling = target.replace(/\.js$/i, ".ts");

                    if (fs.existsSync(simbling))
                    {
                        request.path = simbling;
                    }
                }
            },
        );
    }
}