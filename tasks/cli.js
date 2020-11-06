"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const commander_1 = require("commander");
const common_1 = require("./internal/common");
const tasks_1 = tslib_1.__importDefault(require("./internal/tasks"));
const program = new commander_1.Command();
program.version("1.0.0");
program
    .command("build")
    .option("-m|--modules <n>", "Modules to build", common_1.toArray)
    .action(tasks_1.default.build);
program
    .command("cover <n>")
    .action(tasks_1.default.cover);
program
    .command("clean")
    .option("-m|--modules      <n>", "Modules to clean", common_1.toArray)
    .option("-n|--node-modules [n]", "Clean node_modules and package-lock.json")
    .action(tasks_1.default.clean);
program
    .command("publish <registry>")
    .requiredOption("-t|--token <n>", "NPM token", common_1.toString)
    .option("-c|--config   <n>", "Configuration", common_1.parsePattern(/^development|release$/))
    .option("-d|--debug    [n]", "Debug mode")
    .option("-m|--modules  <n>", "Modules to include in the publish", common_1.toArray, [])
    .option("-s|--strategy <n>", "Strategy to sync dependencies", common_1.toStrategyFlags)
    .option("-t|--target   <n>", "Target version to sync", common_1.toString)
    .action(tasks_1.default.publish);
program.parse(process.argv);
//# sourceMappingURL=cli.js.map