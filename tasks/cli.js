import commander from "commander";
import Commands from "./internal/commands.js";
import { parsePattern, toString } from "./internal/common.js";
const program = new commander.Command();
program.version("1.0.0");
program
    .command("build")
    .action(Commands.build);
program
    .command("cover <n>")
    .action(Commands.cover);
program
    .command("clean")
    .action(Commands.clean);
program
    .command("publish <registry>")
    .requiredOption("--token <n>", "NPM token", toString)
    .option("--config    <n>", "Configuration", parsePattern(/^nightly|release$/))
    .option("--debug     [n]", "Debug mode")
    .option("--timestamp <n>", "Timestamp used version to sync", toString)
    .action(Commands.publish);
program.parse(process.argv);
//# sourceMappingURL=cli.js.map