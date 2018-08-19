import { Nullable, ObjectLiteral } from "@surface/core";
import fs                          from "fs";
import path                        from "path";
import webpack                     from "webpack";

type Chunk =
{
    id:    string;
    name:  string;
    files: Array<string>;
};

namespace HtmlTemplatePlugin
{
    export interface IOptions
    {
        filename: string;
        template: string;
    }
}

class HtmlTemplatePlugin implements webpack.Plugin
{
    private readonly filename: Nullable<string>;
    private readonly template: string;

    public constructor(options?: Partial<HtmlTemplatePlugin.IOptions>)
    {
        if (!options)
        {
            throw new Error("Parameter \"options\" can't be null.");
        }

        if (!options.template)
        {
            throw new Error("Property \"options.template\" can't be null.");
        }

        this.template = options.template;
        this.filename = options.filename;
    }

    private getModuleName(filepath: string): string
    {
        let slices = filepath.split("/").reverse();
        if (slices.length > 1 && slices[0].match(/index.[tj]s/))
        {
            return slices[1];
        }
        else
        {
            return slices[0];
        }
    }

    private templateParse(template: string, keys: ObjectLiteral<string>): string
    {
        for (let key in keys)
        {
            template = template.replace(new RegExp(`{{ *${key} *}}`, "g"), keys[key]);
        }

        return template;
    }

    private filenameParse(filename: string, keys: ObjectLiteral<string>): string
    {
        for (let key in keys)
        {
            filename = filename.replace(new RegExp(`\\[ *${key} *\\]`, "g"), keys[key]);
        }

        return filename;
    }

    public apply(compiler: webpack.Compiler)
    {
        // tslint:disable-next-line:no-this-assignment
        const self = this;
        const filename = self.filename || "[name]/index.html";

        compiler.hooks.emit.tap
        (
            HtmlTemplatePlugin.name,
            // tslint:disable-next-line:no-any
            function (compilation: webpack.compilation.Compilation)
            {
                if (!compiler.options.entry)
                {
                    throw new Error("Entry can\"t be null.");
                }

                if (!compiler.options.context)
                {
                    throw new Error("Context can\"t be null.");
                }

                let entries = compiler.options.entry;

                if (typeof entries == "function")
                {
                    entries = [entries.call(undefined)];
                    if (entries instanceof Promise)
                    {
                        // Todo - Add support to promises
                        entries = [];
                    }
                }

                if (typeof entries == "string")
                {
                    entries = [entries];
                }

                if (Array.isArray(entries))
                {
                    const tmp: ObjectLiteral<string> = { };
                    for (const entry of entries)
                    {
                        tmp[path.dirname(entry)] = entry;
                    }

                    entries = tmp;
                }

                for (const [key, entry] of Object.entries(entries))
                {
                    const chunk = compilation.chunks.filter(x => x.name == key)[0] as Chunk;

                    const keys =
                    {
                        file:   ("/" + chunk.files.filter(x => path.extname(x) == ".js")[0] || "").replace("./", ""),
                        hash:   compilation.hash || "",
                        module: self.getModuleName(Array.isArray(entry) ? entry[0] : entry),
                        name:   chunk.name,
                        id:     chunk.id
                    };

                    const template = fs.readFileSync(path.resolve(compiler.options.context, self.template)).toString();

                    const html = self.templateParse(template, keys);

                    const asset = self.filenameParse(filename, keys);

                    compilation.assets[asset] =
                    {
                        source: () => html,
                        size:   () => html.length
                    };
                }
            }
        );
    }
}

export default HtmlTemplatePlugin;