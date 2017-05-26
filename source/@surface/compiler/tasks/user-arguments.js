"use strict";
const Path = require("path");
module.exports = class {
    static resolve(args) {
        let userArguments = {
            build: args.includes("build"),
            watch: args.includes("watch"),
            enviroment: args.includes("production") ? "production" : "development",
            configuration: {
                path: ""
            }
        };
        let index = args.indexOf("project");
        if (index > -1) {
            if (!args[index + 1])
                throw new Error("Invalid project path");
            let path = args[index + 1];
            if (path.endsWith("/"))
                path = path.concat("surface-project.json");
            userArguments.configuration.path = Path.resolve(process.cwd(), path);
        }
        return userArguments;
    }
};
//# sourceMappingURL=user-arguments.js.map