import { ObjectLiteral, Nullable } from '@surface/types';
import * as fs                     from 'fs';
import * as path                   from 'path';
import * as webPack                from 'webpack';

namespace HtmlTemplatePlugin
{
    export interface Options
    {
        filename: string; 
        template: string;
    }
}

class HtmlTemplatePlugin implements webPack.Plugin
{
    private filename: Nullable<string>;
    private template: string;

    public constructor(options?: Partial<HtmlTemplatePlugin.Options>)
    {
        if (!options)
            throw new Error('Parameter \'options\' can\'t be null.');

        if (!options.template)
            throw new Error('Property \'options.template\' can\'t be null.');

        this.template = options.template;
        this.filename = options.filename;
    }

    public apply (compiler: webPack.Compiler)
    {
        const self = this;
        compiler.plugin
        (
            "emit",
            function (this: webPack.Compiler, compilation: any, callback: (error?: Error) => void)
            {
                if (!this.options.entry)
                    throw new Error('Entry can\'t be null.');

                self.filename = self.filename || '[name]/index.html';

                for (let key in compilation.entrypoints)
                {
                    let entry = compilation.entrypoints[key];
                    let chunk = entry.chunks.filter(x => x.name == key)[0] || entry.chunks[0];

                    let $module = Array.isArray(this.options.entry[key]) ?
                        self.getModuleName(entry.name) :
                        self.getModuleName(this.options.entry[key]);

                    let file = '/' + chunk.files.filter(x => path.extname(x) == '.js')[0] || '';

                    file = file.replace('./', '');

                    let keys =
                    {
                        file:     file,
                        fullHash: compilation.fullHash,
                        hash:     compilation.hash,
                        module:   $module,
                        name:     entry.name,
                        id:       chunk.id
                    };

                    let template = fs.readFileSync(path.resolve(this.options.context, self.template)).toString();

                    let html = self.templateParse(template, keys);

                    let asset = self.filenameParse(self.filename, keys);

                    compilation.assets[asset] =
                    {
                        source: () => html,
                        size:   () => html.length
                    };
                }

                callback();
            }
        );
    }

    private getModuleName(filepath: string): string
    {
        let slices = filepath.split('/').reverse();
        if (slices.length > 1 && slices[0].match(/index.[tj]s/))
            return slices[1];
        else
            return slices[0];
    }

    private templateParse(template: string, keys: ObjectLiteral<string>): string
    {
        for (let key in keys)
            template = template.replace(new RegExp(`{{ *${key} *}}`, "g"), keys[key]);
    
        return template;
    }

    private filenameParse(filename: string, keys: ObjectLiteral<string>): string
    {
        for (let key in keys)
            filename = filename.replace(new RegExp(`\\[ *${key} *\\]`, "g"), keys[key]);

        return filename;
    }
}

export = HtmlTemplatePlugin;