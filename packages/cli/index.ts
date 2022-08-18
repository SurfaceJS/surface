#!/usr/bin/env node

import { Command } from "commander";
import Tasks       from "./internal/tasks.js";

new Command()
    .version("1.0.0")
    .command("new")
    .description("Creates a new project based on selected template.")
    .action(Tasks.new)
    .parse();