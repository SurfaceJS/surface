#!/usr/bin/env node
import * as common    from "@surface/common";
import * as commander from "commander";
import * as fs        from "fs";
import * as path      from "path";

export namespace CodeSplitter
{
    export interface IOptions
    {
        context: string;
        entries: Array<string>;
        output:  string;
    }
}

export class CodeSplitter
{
    private readonly context:  string;
    private readonly entries:  Array<string>;
    private readonly fileType: string;
    private readonly output:   string;

    private constructor(options?: Partial<CodeSplitter.IOptions>)
    {
        if (!options)
        {
            throw new Error("Parameter \"options\" can't be null.");
        }

        if (!options.context)
        {
            throw new Error("Parameter \"options.context\" not specified.");
        }

        if (!options.entries)
        {
            throw new Error("Parameter \"options.entries\" not specified.");
        }

        if (!options.output)
        {
            throw new Error("Parameter \"options.output\" not specified.");
        }

        this.context = path.isAbsolute(options.context) ? options.context : path.resolve(process.cwd(), options.context);
        this.entries = options.entries;
        this.output  = options.output;

        let match = /\.[tj]s/.exec(this.output);

        if (match)
        {
            this.fileType = match[0];
        }
        else
        {
            this.output   = this.output + ".js";
            this.fileType = ".js";
        }
    }

    public static execute(options?: Partial<CodeSplitter.IOptions>)
    {
        new CodeSplitter(options).execute();
    }

    private getModulesPath(entry: string): Array<string>
    {
        let result: Array<string> = [];

        if (!fs.existsSync(entry))
        {
            Promise.reject(new Error("Path not exists"));
        }

        if (!fs.lstatSync(entry).isFile())
        {
            Promise.resolve([entry]);
        }

        for (let source of fs.readdirSync(entry))
        {
            let currentPath = path.join(entry, source);

            if (fs.lstatSync(currentPath).isDirectory())
            {
                for (let extension of [".ts", ".js"])
                {
                    let file = path.join(currentPath, "index" + extension);
                    if (fs.existsSync(file))
                    {
                        result.push(file);
                    }
                }
            }
            else
            {
                result.push(currentPath);
            }
        }

        return result;
    }

    private writeEntry(context: string, filePath: string, modulePath: string): string
    {
        let key          = path.relative(context, modulePath).replace(/\\/g, "/").replace(/(\/index)?(\.[tj]s?)?$/, "");
        let resolvedPath = path.relative(path.dirname(filePath), modulePath).replace(/\\/g, "/").replace(/(\/index)?(\.[tj]s?)?$/, "");

        let result =
        [
            `        case "${key}":`,
            `            return import(/* webpackChunkName: "${key}" */ "${resolvedPath}");`
        ].join("\n");

        return result;
    }

    private writeFooter(): string
    {
        let result =
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
        let result =
        [
            "// File generated automatically. Don't change.",
            "",
            "/**",
            " * Requires the module of the specified path.",
            ` * @param ${this.fileType == ".ts" ? "" : "{string} "}path Path to the module.${this.fileType == ".ts" ? "" : "\n * @returns {Promise}"}`,
            " */",
            this.fileType == ".ts" ? "export async function load(path: string): Promise<Object>" : "export async function load(path)",
            "{",
            "    switch (path)",
            "    {",
        ].join("\n");

        return result;
    }

    private execute()
    {
        let output = this.output;

        if (!this.context)
        {
            throw new Error("Context can\"t be null");
        }

        output = path.resolve(this.context, output);

        let content = "";

        for (let entry of this.entries)
        {
            let modulesPath = this.getModulesPath(path.resolve(this.context, entry));

            content = this.writeHeader() + "\n";

            for (let modulePath of modulesPath)
            {
                content += this.writeEntry(this.context, output, modulePath) + "\n";
            }

            content += this.writeFooter();
        }

        common.makePath(path.dirname(output));
        fs.writeFileSync(output, content);

        console.log(`Code split for the entries [${this.entries.reduce((a, b) => a + ", " + b)}] generated at ${output}`);
    }
}

commander
    .version("0.0.1")
    .option("-c, --context <path>", "Context path")
    .option("-e, --entries <paths>", "Entry files or directories", files => files.split(","))
    .option("-o, --output  <path>", "Output path")
    .parse(process.argv);

CodeSplitter.execute({ context: commander.context, entries: commander.entries, output: commander.output });