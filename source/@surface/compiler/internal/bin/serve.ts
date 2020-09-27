#!/usr/bin/env node

import { Command }                                  from "commander";
import { logLevelPattern, parsePattern, toBoolean } from "../common";
import Tasks                                        from "../tasks";
import createProgram                                from ".";

const program = createProgram()
    .option("--host              <n>", "Dev server hostname.")
    .option("--hot               [n]", "Dev server port.", toBoolean)
    .option("--log-level         <n>", "Dev server port.", parsePattern(logLevelPattern))
    .option("--port              <n>", "Dev server port.", Number)
    .action((command: Command) => void Tasks.serve(command.opts()));

program.parse(process.argv);