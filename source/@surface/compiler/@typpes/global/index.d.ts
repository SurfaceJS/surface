declare namespace Surface
{
    interface Config
    {
        context:       string;
        entry:         string|{ [key: string]: string }|Array<{ [key: string]: string }>;
        filename:      string;
        libraryTarget: string;
        modules:       Array<string>;
        public:        string;
        publicPath:    string;
    }
}