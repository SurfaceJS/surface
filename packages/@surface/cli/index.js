#!/usr/bin/env node
import commander from "commander";
import Tasks from "./internal/tasks.js";
const program = new commander.Command();
program.version("1.0.0");
program
    .command("new")
    .description("Creates a new project based on selected template.")
    .action(Tasks.new);
program.parse(process.argv);
//# sourceMappingURL=index.js.map