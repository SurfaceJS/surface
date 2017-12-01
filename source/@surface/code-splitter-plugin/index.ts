import * as common from '@surface/common';

import * as fs      from 'fs';
import * as path    from 'path';
import * as webpack from 'webpack';

namespace CodeSplitterPlugin
{
    export interface IOptions
    {
        entries: Array<string>;
        useRealPaths:   boolean;
    }
}

class CodeSplitterPlugin
{
    private _entries:   Array<string>;
    private _useRealPaths:     boolean;

    public constructor(options?: Partial<CodeSplitterPlugin.IOptions>)
    {
        if (!options)
        {
            throw new Error('Parameter \'options\' can\'t be null.');
        }

        if (!options.entries)
        {
            throw new Error('Entries not specified');
        }

        this._entries      = options.entries;
        this._useRealPaths = !!options.useRealPaths;
    }

    public apply (compiler: webpack.Compiler)
    {
        const self = this;
        compiler.plugin
        (
            'make',
            // tslint:disable-next-line:no-any
            function (this: webpack.Compiler, compilation: any, callback: (error?: Error) => void)
            {
                if (!this.options.context)
                {
                    throw new Error('Context can\'t be null');
                }

                let sourceFile = path.join(common.lookUp(this.options.context, 'node_modules'), '@surface', 'lazy-loader', 'index.js');

                for (let entry of self._entries)
                {
                    let parsedPaths = self.getPaths(path.resolve(this.options.context, entry));

                    let content = self.writeHeader() + '\n';

                    for (let parsedPath of parsedPaths)
                    {
                        if (parsedPath.name == 'index')
                        {
                            content += self.writeEntry
                            (
                                `${entry}/${parsedPath.dir.split(path.sep).pop()}`,
                                sourceFile,
                                path.format(parsedPath)
                            ) + '\n';
                        }
                        else
                        {
                            content += self.writeEntry
                            (
                                `${entry}/${parsedPath.name}`,
                                sourceFile,
                                path.format(parsedPath)
                            ) + '\n';
                        }
                    }

                    content += self.writeFooter();

                    fs.writeFileSync(sourceFile, content);
                }

                callback();
            }
        );
    }

    private getPaths(entry: string): Array<path.ParsedPath>
    {
        let result: Array<path.ParsedPath> = [];
        
        if (!fs.existsSync(entry))
        {
            throw new Error('Path not exists');
        }
    
        if (!fs.lstatSync(entry).isDirectory())
        {
            throw new Error('Path is not a directory');
        }
    
        for (let source of fs.readdirSync(entry))
        {
            let currentPath = path.join(entry, source);
    
            if (fs.lstatSync(currentPath).isDirectory())
            {
                ['index.ts', 'index.js'].forEach
                (
                    fileName =>
                    {
                        let file = path.join(currentPath, fileName);
                        if (fs.existsSync(file))
                        {
                            result.push(path.parse(file));
                        }

                    }
                );
            }
            else
            {
                result.push(path.parse(currentPath));
            }
        }
    
        return result;
    }

    private writeEntry(name: string, sourceFile: string, filepath: string): string
    {
        name = name.replace('./', '');
        let result =
        [
            `        case '${name}':`,
            `            return import(/* webpackChunkName: '${name}' */ '${(this._useRealPaths ? filepath : path.relative(path.parse(sourceFile).dir, filepath)).replace(/\\/g, '/')}');`
        ].join('\n');
    
        return result;
    }

    private writeFooter(): string
    {
        let result =
        [
            '        default:',
            '            return Promise.reject("path not found");',
            '    }',
            '}',
        ].join('\n');

        return result;
    }

    private writeHeader(): string
    {
        let result =
        [
            'export function load(name)',
            '{',
            '    switch (name)',
            '    {',
        ].join('\n');

        return result;
    }
}

export = CodeSplitterPlugin;