import { Command }                                          from "commander";
import { parsePattern, toArray, toStrategyFlags, toString } from "./internal/common";
import Tasks                                                from "./internal/tasks";

const program = new Command();

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
    .command("install")
    .option("-m|--modules <n>", "Modules to install", toArray, [])
    .action(Tasks.install);

program
    .command("link")
    .option("-m|--modules <n>", "Modules to link", toArray, [])
    .action(Tasks.link);

program
    .command("publish <registry>")
    .requiredOption("-t|--token <n>", "NPM token", toString)
    .option("-c|--config   <n>", "Configuration", parsePattern(/^development|release$/))
    .option("-d|--debug    [n]", "Debug mode")
    .option("-m|--modules  <n>", "Modules to include in the publish", toArray, [])
    .option("-s|--strategy <n>", "Strategy to sync dependencies", toStrategyFlags)
    .option("-t|--target   <n>", "Target version to sync", toString)
    .action(Tasks.publish);

program
    .command("relink")
    .option("-m|--modules <n>", "Modules to relink", toArray, [])
    .action(Tasks.relink);

program
    .command("setup")
    .action(Tasks.setup);

program
    .command("sync")
    .option("-r|--registry <n>", "Registry", toStrategyFlags)
    .option("-s|--strategy <n>", "Strategy to sync dependencies", toStrategyFlags)
    .option("-m|--modules  [n]", "Modules to sync", toArray, [])
    .option("-t|--template <n>", "Template version to sync", toString)
    .action(Tasks.sync);

program
    .command("unlink")
    .option("-m|--modules [n]", "Modules to unlink", toArray, [])
    .action(Tasks.unlink);

program.parse(process.argv);
