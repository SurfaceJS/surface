#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const commander_1 = require("commander");
function createCommandOptions(target) {
    return { executableFile: path_1.default.resolve(__dirname, `./bin/${target}.js`) };
}
const program = new commander_1.Command();
program.command("analyze [options]", "Analyze bundle size.", createCommandOptions("analyze")).alias("a");
program.command("build   [options]", "Compile project.", createCommandOptions("build")).alias("b");
program.command("clean   [options]", "Remove build cache.", createCommandOptions("clean")).alias("c");
program.command("serve   [options]", "Starts dev server.", createCommandOptions("serve")).alias("s");
program.parse(process.argv);
//# sourceMappingURL=cli.js.map