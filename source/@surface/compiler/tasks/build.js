"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Webpack = require("webpack");
const config = require("./webpack-config");
const UserArguments = require("./user-arguments");
const userArguments = UserArguments.resolve(process.argv);
let compiler = Webpack(config(userArguments.configuration.path));
let statOptions = {
    assets: true,
    version: true,
    colors: true,
    warnings: true,
    errors: true
};
let callback = (error, stats) => error ? console.log(error.message) : console.log(stats.toString(statOptions));
let isWatching = userArguments.watch;
console.log(`Starting ${isWatching ? "Watch" : "build"} using ${userArguments.enviroment} configuration.`);
if (isWatching)
    compiler.watch({ aggregateTimeout: 500, poll: true, ignored: /node_modules/ }, callback);
else
    compiler.run(callback);
//# sourceMappingURL=build.js.map