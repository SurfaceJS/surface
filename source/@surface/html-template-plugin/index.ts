import Common  = require('@surface/common');
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
                for (let entry of self._options.entries)
                {
                    let keys =
                    {
                        hash: compilation.hash
                    };
                    
                    let template = require(self._options.template)

                    let html = Common.templateParse(template, keys)

                    compilation.assets[`${entry}/index.html`] =
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