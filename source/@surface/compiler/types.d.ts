import { ObjectLiteral } from '@surface/types';
import * as webpack      from 'webpack';

export namespace Compiler
{    
    export interface Plugin
    {
        name:    string;
        options: ObjectLiteral;
    }

    export type Entry = string|Array<string>|ObjectLiteral<string>|ObjectLiteral<Array<string>>;

    export interface Config
    {
        context:        string;
        entry:          Entry;
        filename:       string;
        output:         string;
        runtime?:       string;
        plugins?:       Array<Plugin>;
        webpackConfig?: string|webpack.Configuration;
        tsconfig?:      string;
    }
}