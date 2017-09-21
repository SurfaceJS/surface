declare namespace Surface
{
    export namespace Compiler
    {
        export interface Plugin
        {
            new (options: LiteralObject): Plugin;
            apply: (compiler: any) => void;
        }
        
        export interface Plugin
        {
            name:    string;
            options: LiteralObject
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
}