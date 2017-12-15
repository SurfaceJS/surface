import * as fs      from "fs";
import * as path    from "path";
import * as webPack from "webpack";

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

class SimblingPriorityPlugin implements webPack.Plugin
{
    private _exclude: Array<string>;
    private _from:    string;
    private _include: Array<string>;
    private _to:      string;

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

        this._exclude = options.exclude;
        this._from    = options.from;
        this._include = options.include;
        this._to      = options.to;
    }

    // tslint:disable-next-line:no-any
    public apply (resolver: any): void
    {
        let self = this;

        resolver.plugin
        (
            "resolved",
            function(request, callback)
            {
                let target    = request.path;
                let extension = path.parse(target).ext;

                let canExecute = (self._include.length == 0 || self._include.some(x => target.toLowerCase().startsWith(x.toLowerCase())))
                    && !self._exclude.some(x => target.toLowerCase().startsWith(x.toLowerCase()));

                if (canExecute)
                {
                    let simbling = target.replace(new RegExp(`\\${self._from}$`), self._to);

                    if ((!extension || extension == self._from) && fs.existsSync(simbling))
                    {
                        request.path = simbling;
                    }
                }

                callback();
            }
        );
    }
}

export = SimblingPriorityPlugin;