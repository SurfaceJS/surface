import Path = require("path");

class Project
{
    public context:       string;
    public entry:         Array<string>;
    public public:        string;
    public publicPath:    string;
    public filename:      string;
    public libraryTarget: string;
    public modules:       Array<string>;
    public target:        string;

    public constructor(project: Object, root: string)
    {
        if (project["context"])
            this.context = Path.resolve(root, project["context"]);
    }
}

export = Project;