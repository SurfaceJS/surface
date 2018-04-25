import * as common from "@surface/common";
import fs          from "fs";
import path        from "path";

namespace CodeSplitter
{
    export interface IOptions
    {
        context: string;
        entries: Array<string>;
        output:  string;
    }
}

class CodeSplitter
{
    private readonly context:  string;
    private readonly entries:  Array<string>;
    private readonly extension: string;
    private readonly output:   string;

    private constructor(options?: Partial<CodeSplitter.IOptions>)
    {
        if (!options)
        {
            throw new Error("parameter \"options\" not specified");
        }

        if (!options.context)
        {
            throw new Error("parameter \"options.context\" not specified");
        }

        if (!options.entries)
        {
            throw new Error("parameter \"options.entries\" not specified");
        }

        if (!options.output)
        {
            throw new Error("parameter \"options.output\" not specified");
        }

        this.context = path.isAbsolute(options.context) ? options.context : path.resolve(process.cwd(), options.context);
        this.entries = options.entries;
        this.output  = options.output;

        let match = /\.[tj]s/.exec(this.output);

        if (match)
        {
            this.extension = match[0];
        }
        else
        {
            this.output   = this.output + ".js";
            this.extension = ".js";
        }
    }

    public static execute(options?: Partial<CodeSplitter.IOptions>)
    {
        new CodeSplitter(options).execute();
    }

    private isTsSimbling(filePath: string): boolean
    {
        return (this.extension == ".ts" && filePath.endsWith(".js") && fs.existsSync(filePath.replace(/\.js$/, ".ts")));
    }

    private getModulesPath(entry: string): Array<string>
    {
        const result = [] as Array<string>;

        if (!fs.existsSync(entry))
        {
            throw new Error(`entry ${entry} path not exists`);
        }

        if (fs.lstatSync(entry).isFile())
        {
            return [entry];
        }

        for (const source of fs.readdirSync(entry))
        {
            const filePath = path.join(entry, source);

            for (const extension of [".js", ".ts"])
            {
                if (fs.lstatSync(filePath).isDirectory())
                {
                    const file = path.join(filePath, "index" + extension);

                    if (fs.existsSync(file) && !this.isTsSimbling(file))
                    {
                        result.push(file);
                    }
                }
                else if (filePath.endsWith(extension) && !this.isTsSimbling(filePath))
                {
                    result.push(filePath);
                }
            }
        }

        return result;
    }

    private writeEntry(context: string, filePath: string, modulePath: string): string
    {
        const key          = path.relative(context, modulePath).replace(/\\/g, "/").replace(/(\/index)?(\.[tj]s?)?$/, "");
        const resolvedPath = path.relative(path.dirname(filePath), modulePath).replace(/\\/g, "/").replace(/(\/index)?(\.[tj]s?)?$/, "");

        const result =
        [
            `        case "${key}":`,
            `            return import(/* webpackChunkName: "${key}" */ "${resolvedPath}");`
        ].join("\n");

        return result;
    }

    private writeFooter(): string
    {
        const result =
        [
            "        default:",
            "            return Promise.reject(\"path not found\");",
            "    }",
            "}",
        ].join("\n");

        return result;
    }

    private writeHeader(): string
    {
        const result =
        [
            "// File generated automatically. Don't change.",
            "",
            "/**",
            " * Requires the module of the specified path.",
            ` * @param ${this.extension == ".ts" ? "" : "{string} "}path Path to the module.${this.extension == ".ts" ? "" : "\n * @returns {Promise}"}`,
            " */",
            this.extension == ".ts" ? "export async function load(path: string): Promise<Object>" : "export async function load(path)",
            "{",
            "    switch (path)",
            "    {",
        ].join("\n");

        return result;
    }

    private execute()
    {
        let output = this.output;

        output = path.resolve(this.context, output);

        let content = this.writeHeader() + "\n";

        for (const entry of this.entries)
        {
            const modulesPath = this.getModulesPath(path.resolve(this.context, entry));

            for (const modulePath of modulesPath)
            {
                content += this.writeEntry(this.context, output, modulePath) + "\n";
            }
        }

        content += this.writeFooter();

        common.makePath(path.dirname(output));
        fs.writeFileSync(output, content);

        console.log(`Code split for the entries [${this.entries.reduce((a, b) => a + ", " + b)}] generated at ${output}`);
    }
}

export default CodeSplitter;