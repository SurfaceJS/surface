import fs                from "fs";
import path              from "path";
import { ResolvePlugin } from "webpack";

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace SimblingPriorityPlugin
{
    export interface IOptions
    {
        exclude: string[];
        from:    string;
        include: string[];
        to:      string;
    }
}

class SimblingPriorityPlugin implements ResolvePlugin
{
    private readonly exclude: string[];
    private readonly from:    string;
    private readonly include: string[];
    private readonly to:      string;

    public constructor(options?: Partial<SimblingPriorityPlugin.IOptions>)
    {
        if (!options)
        {
            throw new Error("Parameter \"options\" can't be null.");
        }

        if (!options.from)
        {
            throw new Error("Parameter \"options.from\" can't be null.");
        }

        if (!options.to)
        {
            throw new Error("Parameter \"options.to\" can't be null.");
        }

        options.exclude = options.exclude ?? [];
        options.include = options.include ?? [];

        options.exclude.forEach
        (
            (item, index) =>
            {
                if (!path.isAbsolute(item))
                {
                    throw new Error(`Parameter \"options.exclude[${index}]\" must be an valid absolute path.`);
                }
            },
        );

        options.include.forEach
        (
            (item, index) =>
            {
                if (!path.isAbsolute(item))
                {
                    throw new Error(`Parameter \"options.include[${index}]\" must be an valid absolute path.`);
                }
            },
        );

        this.exclude = options.exclude;
        this.from    = options.from;
        this.include = options.include;
        this.to      = options.to;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public apply(resolver: any): void
    {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;

        resolver.hooks.resolved.tap
        (
            SimblingPriorityPlugin.name,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (request: any): void =>
            {
                const target    = request.path;
                const extension = path.parse(target).ext;

                const canExecute = (self.include.length == 0 || self.include.some(x => target.toLowerCase().startsWith(x.toLowerCase())))
                    && !self.exclude.some(x => target.toLowerCase().startsWith(x.toLowerCase()));

                if (canExecute)
                {
                    const simbling = target.replace(new RegExp(`\\${self.from}$`), self.to);

                    if ((!extension || extension == self.from) && fs.existsSync(simbling))
                    {
                        request.path = simbling;
                    }
                }
            },
        );
    }
}

export default SimblingPriorityPlugin;