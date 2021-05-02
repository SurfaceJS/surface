import commander                  from "commander";
import Commands                   from "./internal/commands.js";
import { parsePattern, toString } from "./internal/common.js";

const program = new commander.Command();

program.version("1.0.0");

program
    .command("cover <n>")
    .action(Commands.cover);

program
    .command("publish <registry>")
    .requiredOption("--token     <n>", "NPM token", toString)
    .option("--config    <n>", "Configuration", parsePattern(/^nightly|release$/))
    .option("--debug     [n]", "Debug mode")
    .action(Commands.publish);

program.parse(process.argv);
