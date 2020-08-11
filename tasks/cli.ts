import { Command }                            from "commander";
import { toArray, toStrategyFlags, toString } from "./internal/common";
import Tasks                                  from "./internal/tasks";

const program = new Command();

program.version("1.0.0");

program
    .command("build")
    .option("-m|--modules [modules]", "Modules to build", toArray)
    .action(Tasks.build);

program
    .command("cover <filepath>")
    .action(Tasks.cover);

program
    .command("clean")
    .option("-m|--modules [modules]", "Modules to clean", toArray)
    .action(Tasks.clean);

program
    .command("install")
    .option("-m|--modules [modules]", "Modules to install", toArray, [])
    .action(Tasks.install);

program
    .command("link")
    .option("-m|--modules [modules]", "Modules to link", toArray, [])
    .action(Tasks.link);

program
    .command("publish <registry>")
    .requiredOption("-t|--token <token>", "NPM token", toString)
    .option("-c|--config <config>",   "Configuration", toString, "development")
    .option("-i|--include [include]", "Modules to include in the publish", toArray, [])
    .option("-e|--exclude [exclude]", "Modules to exclude in the publish", toArray, [])
    .action(Tasks.publish);

program
    .command("relink")
    .option("-m|--modules [modules]", "Modules to relink", toArray, [])
    .action(Tasks.relink);

program
    .command("setup")
    .action(Tasks.setup);

program
    .command("sync <lookup-path>")
    .option("-r|--registry <registry>", "Registry", toStrategyFlags)
    .option("-s|--strategy <strategy>", "Strategy to sync dependencies", toStrategyFlags)
    .option("-i|--include [include]",   "Modules to include in the publish", toArray, [])
    .option("-e|--exclude [exclude]",   "Modules to exclude in the publish", toArray, [])
    .option("-t|--template <template>", "Template version to sync", toString)
    .action(Tasks.sync);

program
    .command("unlink")
    .option("-m|--modules [modules]", "Modules to unlink", toArray, [])
    .action(Tasks.unlink);

program.parse(process.argv);
