import Common  = require('@surface/common');
import FS      = require('fs');
import Path    = require('path');
import WebPack = require('webpack');

namespace HtmlPlugin
{
    export interface Options
    {
        entries:  Array<string>;
        pattern:  RegExp;
        template: string;
    }
}

class HtmlPlugin
{
    private _options: HtmlPlugin.Options;

    public constructor(options: HtmlPlugin.Options)
    {
        this._options = options;
    }

    public apply (compiler: WebPack.Compiler)
    {
        const self = this!;
        compiler.plugin
        (
            "emit",
            function (this: WebPack.Compiler, compilation: any, callback: (error?: Error) => void)
            {
                for (let key in self._options.entries)
                {
                    let keys =
                    {
                        hash: compilation.hash
                    };
                    
                    let template = FS.readFileSync(Path.resolve(this.options.context!, self._options.template)).toString();

                    let html = Common.templateParse(template, keys);

                    compilation.assets[`${key}/index.html`] =
                    {
                        source: () => html,
                        size:   () => html.length
                    };
                }

                callback();
            }
        );
    };
}

export = HtmlPlugin;