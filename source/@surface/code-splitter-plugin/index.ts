import * as common from "@surface/common";

import * as fs      from "fs";
import * as path    from "path";
import * as webpack from "webpack";

namespace CodeSplitterPlugin
{
    export interface IOptions
    {
        entries:          Array<string>;
        output:           string;
    }
}

const LAZY_LOADER = "@surface/lazy-loader";

class CodeSplitterPlugin
{
    private _entries:          Array<string>;
    private _fileType:         string;
    private _output:           string;

    public constructor(options?: Partial<CodeSplitterPlugin.IOptions>)
    {
        if (!options)
        {
            throw new Error("Parameter \"options\" can't be null.");
        }

        if (!options.entries)
        {
            throw new Error("Parameter \"options.entries\" not specified.");
        }

        if (!options.output)
        {
            throw new Error("Parameter \"options.output\" not specified.");
        }

        this._entries          = options.entries;
        this._output           = options.output;

        if (this._output == LAZY_LOADER)
        {
            this._fileType = ".js";
        }
        else
        {
            let match = /\.[tj]s/.exec(this._output);

            if (match)
            {
                this._fileType = match[0];
            }
            else
            {
                this._output   = this._output + ".js";
                this._fileType = ".js";
            }
        }
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
            " * Requires the specified path module.",
            ` * @param ${this._fileType == ".ts" ? "" : "{string} "}path Path to the module.${this._fileType == ".ts" ? "" : "\n * @returns {Promise}"}`,
            " */",
            this._fileType == ".ts" ? "export function load(path: string): Promise<Object>" : "export function load(path)",
            "{",
            "    switch (path)",
            "    {",
        ].join("\n");

        return result;
    }

    public apply (compiler: webpack.Compiler)
    {
        let output = this._output;
        const self = this;

        compiler.plugin
        (
            "make",
            // tslint:disable-next-line:no-any
            function (this: webpack.Compiler, compilation: any, callback: (error?: Error) => void)
            {
                try
                {
                    if (!this.options.context)
                    {
                        throw new Error("Context can\"t be null");
                    }

                    if (output == LAZY_LOADER)
                    {
                        let lazyLoader = common.lookUp(this.options.context, "node_modules/@surface/view-manager/node_modules/@surface/lazy-loader/index.js")
                            || common.lookUp(this.options.context, "node_modules/@surface/lazy-loader/index.js");

                        if (lazyLoader)
                        {
                            output = lazyLoader;
                        }
                        else
                        {
                            throw new Error("@surface/lazy-loader isn't installed.");
                        }
                    }
                    else
                    {
                        output = path.isAbsolute(output) ? output : path.resolve(this.options.context, output);
                    }

                    let parsedPath = path.parse(output);

                    output = fs.lstatSync(parsedPath.dir).isSymbolicLink() ?
                        path.join(fs.readlinkSync(parsedPath.dir), parsedPath.name + parsedPath.ext) : output;

                    let content = "";

                    for (let entry of self._entries)
                    {
                        let modulesPath = self.getModulesPath(path.resolve(this.options.context, entry));

                        content = self.writeHeader() + "\n";

                        for (let modulePath of modulesPath)
                        {
                            content += self.writeEntry(this.options.context, output, modulePath) + "\n";
                        }

                        content += self.writeFooter();
                    }

                    common.makePath(path.dirname(output));
                    fs.writeFileSync(output, content);

                    callback();
                }
                catch (error)
                {
                    callback(error);
                }
            }
        );
    }
}

export = CodeSplitterPlugin;