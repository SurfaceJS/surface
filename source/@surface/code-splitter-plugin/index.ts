import Common  = require('@surface/common');
import FS      = require('fs');
import Path    = require('path');
import WebPack = require('webpack');

namespace CodeSplitterPlugin
{
    export interface Options
    {
        entries: Array<string>;
    }
}

class CodeSplitterPlugin
{
    private _options: CodeSplitterPlugin.Options;

    public constructor(options: CodeSplitterPlugin.Options)
    {
        this._options = options;
    }

    public apply (compiler: WebPack.Compiler)
    {
        const self = this;
        compiler.plugin
        (
            'make',
            function (this: WebPack.Compiler, compilation: any, callback: (error?: Error) => void)
            {
                if (!self._options.entries)
                    throw new Error('Entries not specified');

                if (!this.options.context)
                    throw new Error('Context can\'t be null');

                let file = Path.join(Common.lookUp(this.options.context, 'node_modules'), '@surface', 'lazy-loader', 'index.js');

                for (let entry of self._options.entries)
                {
                    let paths = self.getPaths(Path.resolve(this.options.context, entry));

                    let content = self.writeHeader() + '\n';

                    for (let path of paths)
                    {
                        if (path.name == 'index')
                            content += self.writeEntry
                            (
                                `${entry}/${Common.getParentPath(Path.format(path))}`,
                                Path.format(path)
                            ) + '\n';
                        else
                            content += self.writeEntry
                            (
                                `${entry}/${path.name}`,
                                Path.format(path)
                            ) + '\n';
                    }

                    content += self.writeFooter();

                    FS.writeFileSync(file, content);
                }

                callback();
            }
        );
    }

    private getPaths(entry: string): Array<Path.ParsedPath>
    {
        let result: Array<Path.ParsedPath> = [];
        
        if (!FS.existsSync(entry))
            throw new Error('Path not exists');
    
        if (!FS.lstatSync(entry).isDirectory())
            throw new Error('Path is not a directory');
    
        for (let source of FS.readdirSync(entry))
        {
            let currentPath = Path.join(entry, source);
    
            if (FS.lstatSync(currentPath).isDirectory())
            {
                ['index.ts', 'index.js'].forEach
                (
                    fileName =>
                    {
                        let file = Path.join(currentPath, fileName)
                        if (FS.existsSync(file))
                            result.push(Path.parse(file));

                    }
                )
            }
            else
                result.push(Path.parse(currentPath));
        }
    
        return result;
    }

    private writeEntry(name: string, path: string): string
    {
        name = name.replace('./', '')
        let result =
        [
            `        case '${name}':`,
            `            return import(/* webpackChunkName: '${name}' */ '${path.replace(/\\/g, '\\\\')}');`
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
            'export default function(name)',
            '{',
            '    switch (name)',
            '    {',
        ].join('\n');

        return result;
    }
}


export = CodeSplitterPlugin;