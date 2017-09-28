import { LiteralObject } from '@surface/core/typings';
import * as Webpack      from 'webpack';

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
        context:        string;
        entry:          Entry;
        filename:       string;
        libraryTarget?: string;
        modules?:       Array<string>;
        public:         string;
        publicPath:     string;
        plugins?:       Array<Plugin>
    }
}