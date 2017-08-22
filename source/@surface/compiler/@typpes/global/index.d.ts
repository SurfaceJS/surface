declare namespace Surface
{
    export interface Plugin
    {
        new (options: LiteralObject): Plugin;
        apply: (compiler: any) => void;
    }

    export namespace Config
    {
        interface Plugin
        {
            name:    string;
            options: LiteralObject
        }
    }

    export interface Config
    {
        context:       string;
        entry:         string|LiteralObject<string>|Array<LiteralObject<string>>;
        filename:      string;
        libraryTarget: string;
        modules:       Array<string>;
        public:        string;
        publicPath:    string;
        plugins:       Array<Config.Plugin>
    }
}
