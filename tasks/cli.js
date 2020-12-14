import commander from "commander";
import { parsePattern, toArray, toStrategyFlags, toString } from "./internal/common.js";
import Tasks from "./internal/tasks.js";
const program = new commander.Command();
program.version("1.0.0");
program
    .command("build")
    .option("-m|--modules <n>", "Modules to build", toArray)
    .action(Tasks.build);
program
    .command("cover <n>")
    .action(Tasks.cover);
program
    .command("clean")
    .option("-m|--modules      <n>", "Modules to clean", toArray)
    .option("-n|--node-modules [n]", "Clean node_modules and package-lock.json")
    .action(Tasks.clean);
program
    .command("publish <registry>")
    .requiredOption("-t|--token <n>", "NPM token", toString)
    .option("-c|--config   <n>", "Configuration", parsePattern(/^development|release$/))
    .option("-d|--debug    [n]", "Debug mode")
    .option("-m|--modules  <n>", "Modules to include in the publish", toArray, [])
    .option("-s|--strategy <n>", "Strategy to sync dependencies", toStrategyFlags)
    .option("-t|--target   <n>", "Target version to sync", toString)
    .action(Tasks.publish);
program.parse(process.argv);
//# sourceMappingURL=cli.js.map