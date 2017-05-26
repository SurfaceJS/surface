"use strict";
const Path = require("path");
class Project {
    constructor(project, root) {
        if (project["context"])
            this.context = Path.resolve(root, project["context"]);
    }
}
module.exports = Project;
//# sourceMappingURL=project.js.map