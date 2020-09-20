#!/usr/bin/env node

import { Command } from "commander";
import Tasks       from "../tasks";

const clean = new Command()
    .storeOptionsAsProperties(false)
    .option("-p, --project <n>", "Path to project file (absolute path).")
    .action((command: Command) => void Tasks.clean(command.opts()));

clean.parse(process.argv);