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

                let file = Common.resolveNodeModules(this.options.context);

                let modules = self.resolveModule(self._options.entries);

                FS.writeFileSync(file, self.writeHeader());

                for (let $module in modules)
                {                    
                    FS.writeFileSync(file, self.writeEntry($module));
                }

                FS.writeFileSync(file, self.writeFooter());
            }
        );
    }

    private resolveModule(entries: Array<string>): Array<string>
    {
        let result: Array<string> = [];
    
        for (let entry of entries)
        {
            if (!FS.existsSync(entry))
                throw new Error('Path not exists');
        
            if (!FS.lstatSync(entry).isDirectory())
                throw new Error('Path is not a directory');
        
            for (let source of FS.readdirSync(entry))
            {
                let currentPath = Path.join(entry, source);
        
                if (FS.lstatSync(currentPath).isDirectory())
                {
                    if (FS.existsSync(Path.join(currentPath, 'index.ts')) || FS.existsSync(Path.join(currentPath, 'index.js')))
                        result.push(currentPath.split('/').reverse()[0]);
                }
                else
                    result.push(currentPath.split('/').reverse()[0]);
            }
        }
    
        return result;
    }

    private writeEntry($module: string): string
    {
        let result =
        [
            `    case '${$module}':`,
            `        return import('${$module}');`
        ].join('');
    
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
        ].join('');

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
        ].join('');

        return result;
    }
}


export = CodeSplitterPlugin;