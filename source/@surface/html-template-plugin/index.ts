import { LiteralObject } from '@surface/types';

import FS      = require('fs');
import Path    = require('path');
import WebPack = require('webpack');

namespace HtmlTemplatePlugin
{
    export interface Options
    {
        entries:  Array<string>;
        pattern:  RegExp;
        template: string;
    }
}

class HtmlTemplatePlugin implements WebPack.Plugin
{
    private _options: HtmlTemplatePlugin.Options;

    public constructor(options: HtmlTemplatePlugin.Options)
    {
        this._options = options;
    }

    public apply (compiler: WebPack.Compiler)
    {
        const self = this;
        compiler.plugin
        (
            "emit",
            function (this: WebPack.Compiler, compilation: any, callback: (error?: Error) => void)
            {
                if (!this.options.entry)
                    throw new Error('Entry can\'t be null');

                for (let key in compilation.entrypoints)
                {
                    let entry = compilation.entrypoints[key];
                    let chunk = entry.chunks.filter(x => x.name == key)[0] || entry.chunks[0];

                    let $module = Array.isArray(this.options.entry[key]) ?
                        self.getModuleName(entry.name) :
                        self.getModuleName(this.options.entry[key]);

                    let file = self.resolveFilePath(compilation.options.output.path, entry.name, chunk.files.filter(x => x.match(/.+?\.js$/))[0]);

                    let keys =
                    {
                        file:     file,
                        fullHash: compilation.fullHash,
                        hash:     compilation.hash,
                        module:   $module,
                        name:     entry.name,
                        id:       chunk.id
                    };

                    let template = FS.readFileSync(Path.resolve(this.options.context!, self._options.template)).toString();

                    let html = self.templateParse(template, keys);

                    compilation.assets[`${entry.name}/index.html`] =
                    {
                        source: () => html,
                        size:   () => html.length
                    };
                }

                callback();
            }
        );
    }

    private getModuleName(path: string): string
    {
        let slices = path.split('/').reverse();
        if (slices.length > 1 && slices[0].match(/index.[tj]s/))
            return slices[1];
        else
            return slices[0];
    }

    private resolveFilePath(output: string, entryName: string, file: string): string
    {
        return Path.relative(Path.join(output, entryName), Path.join(output, file)).replace(/\\/g, '/');
    }

    private templateParse(template: string, keys: LiteralObject<string>): string
    {
        for (let key in keys)
            template = template.replace(new RegExp(`{{ *${key} *}}`, "g"), keys[key]);
    
        return template;
    }
}

export = HtmlTemplatePlugin;