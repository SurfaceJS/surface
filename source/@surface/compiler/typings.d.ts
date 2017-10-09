import { LiteralObject }   from '@surface/core/typings';
import { CompilerOptions } from 'typescript';
import * as Webpack        from 'webpack';

export namespace Compiler
{
    export interface Plugin extends Webpack.Plugin
    {
        new (options: LiteralObject): Plugin;
        name:         string;
        options:      LiteralObject;
    }

    export type Entry = string|Array<string>|LiteralObject<string>|LiteralObject<Array<string>>;

    export interface Config
    {
        context:     string;
        entry:       Entry;
        filename:    string;
        public:      string;
        plugins?:    Array<Plugin>;
        webpack?:    string|Webpack.Configuration;
        typescript?: string|CompilerOptions;
    }
}