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
                if (!this.options.entry)
                    throw new Error('Entry can\t be null');

                for (let key in compilation.entrypoints)
                {
                    let entry = compilation.entrypoints[key];
                    let chunk = entry.chunks[0];

                    let $module = Array.isArray(this.options.entry[key]) ?
                        Common.getModule(entry.name) :
                        Common.getModule(this.options.entry[key]);

                    let keys =
                    {
                        file:     chunk.files.filter(x => x.match(/.+?\.js$/))[0],
                        fullHash: compilation.fullHash,
                        hash:     compilation.hash,
                        module:   $module,
                        name:     entry.name,
                        id:       chunk.id
                    };

                    let template = FS.readFileSync(Path.resolve(this.options.context!, self._options.template)).toString();

                    let html = Common.templateParse(template, keys);

                    compilation.assets[`${entry.name}/index.html`] =
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