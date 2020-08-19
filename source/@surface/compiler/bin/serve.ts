#!/usr/bin/env node

import { Command }                                    from "commander";
import { logLevelPattern, parsePattern, toBoolean } from "../internal/common";
import Tasks                                          from "../internal/tasks";
import main                                           from "./main";

main
    .option("--host              <n>", "Dev server hostname.")
    .option("--hot               <n>", "Dev server port.", toBoolean)
    .option("--log-level         <n>", "Dev server port.", parsePattern(logLevelPattern))
    .option("--port              <n>", "Dev server port.", Number)
    .action((command: Command) => Tasks.serve(command.opts()));

main.parse(process.argv);