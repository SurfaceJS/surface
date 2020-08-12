import fs          from "fs";
import path        from "path";
import { Indexer } from "@surface/core";
import webpack     from "webpack";
import { Entry }   from "../interfaces/types";

type Chunk =
{
    id:    string,
    name:  string,
    files: string[],
};

// eslint-disable-next-line @typescript-eslint/no-namespace
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
    private readonly filename?: string;
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
        const slices = filepath.split("/").reverse();
        if (slices.length > 1 && /index.[tj]s/.test(slices[0]))
        {
            return slices[1];
        }

        return slices[0];
    }

    private templateParse(source: string, keys: Indexer<string>): string
    {
        let template = source;

        for (const [key, value] of Object.entries(keys))
        {
            template = template.replace(new RegExp(`{{ *${key} *}}`, "g"), value ?? "");
        }

        return template;
    }

    private filenameParse(source: string, keys: Indexer<string>): string
    {
        let filename = source;

        for (const [key, value] of Object.entries(keys))
        {
            filename = filename.replace(new RegExp(`\\[ *${key} *\\]`, "g"), value ?? "");
        }

        return filename;
    }

    public apply(compiler: webpack.Compiler): void
    {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        const filename = self.filename ?? "[name]/index.html";

        compiler.hooks.emit.tap
        (
            HtmlTemplatePlugin.name,
            (compilation: webpack.compilation.Compilation) =>
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
                    entries = entries() as Entry;

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
                    const tmp: webpack.Entry = { };
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
                        file:   (`/${chunk.files.filter(x => path.extname(x) == ".js")[0]}` || "").replace("./", ""),
                        hash:   compilation.hash ?? "",
                        id:     chunk.id,
                        module: self.getModuleName(Array.isArray(entry) ? entry[0] : entry),
                        name:   chunk.name,
                    };

                    const template = fs.readFileSync(path.resolve(compiler.options.context, self.template)).toString();

                    const html = self.templateParse(template, keys);

                    const asset = self.filenameParse(filename, keys);

                    compilation.assets[asset] =
                    {
                        size:   () => html.length,
                        source: () => html,
                    };
                }
            },
        );
    }
}

export default HtmlTemplatePlugin;