import fs                from "fs";
import path              from "path";
import { ResolvePlugin } from "webpack";

namespace SimblingPriorityPlugin
{
    export interface IOptions
    {
        exclude: Array<string>;
        from:    string;
        include: Array<string>;
        to:      string;
    }
}

class SimblingPriorityPlugin implements ResolvePlugin
{
    private exclude: Array<string>;
    private from:    string;
    private include: Array<string>;
    private to:      string;

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

        options.exclude = options.exclude || [];
        options.include = options.include || [];

        options.exclude.forEach
        (
            (item, index) =>
            {
                if (!path.isAbsolute(item))
                {
                    throw new Error(`Parameter \"options.exclude[${index}]\" must be an valid absolute path.`);
                }
            }
        );

        options.include.forEach
        (
            (item, index) =>
            {
                if (!path.isAbsolute(item))
                {
                    throw new Error(`Parameter \"options.include[${index}]\" must be an valid absolute path.`);
                }
            }
        );

        this.exclude = options.exclude;
        this.from    = options.from;
        this.include = options.include;
        this.to      = options.to;
    }

    // tslint:disable-next-line:no-any
    public apply(resolver: any): void
    {
        // tslint:disable-next-line:no-this-assignment
        const self = this;

        resolver.hooks.resolved.tap
        (
            SimblingPriorityPlugin.name,
            // tslint:disable-next-line:no-any
            function(request: any)
            {
                let target    = request.path;
                let extension = path.parse(target).ext;

                let canExecute = (self.include.length == 0 || self.include.some(x => target.toLowerCase().startsWith(x.toLowerCase())))
                    && !self.exclude.some(x => target.toLowerCase().startsWith(x.toLowerCase()));

                if (canExecute)
                {
                    let simbling = target.replace(new RegExp(`\\${self.from}$`), self.to);

                    if ((!extension || extension == self.from) && fs.existsSync(simbling))
                    {
                        request.path = simbling;
                    }
                }
            }
        );
    }
}

export default SimblingPriorityPlugin;