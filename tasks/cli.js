#!/usr/bin/env node
import { Command } from "commander";
import Commands from "./internal/commands.js";
const program = new Command();
program
    .name("tasks")
    .version("1.0.0");
program
    .command("build-release")
    .action(Commands.buildRelease);
program
    .command("cover <n>")
    .action(Commands.cover);
program
    .command("test <n>")
    .action(Commands.test);
program.parse();
//# sourceMappingURL=cli.js.map