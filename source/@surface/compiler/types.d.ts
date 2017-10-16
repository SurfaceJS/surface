import { LiteralObject }   from '@surface/types';
import { CompilerOptions } from 'typescript';
import * as Webpack        from 'webpack';

export namespace Compiler
{    
    export interface Plugin
    {
        name:    string;
        options: LiteralObject;
    }

    export type Entry = string|Array<string>|LiteralObject<string>|LiteralObject<Array<string>>;

    export interface Config
    {
        context:        string;
        entry:          Entry;
        filename:       string;
        output:         string;
        runtime?:       string;    
        plugins?:       Array<Plugin>;
        webpackConfig?: string|Webpack.Configuration;
        tsconfig?:      string;
    }
}