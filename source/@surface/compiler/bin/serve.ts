#!/usr/bin/env node

import type { Command }            from "commander";
import { parsePattern, toBoolean } from "../internal/common.js";
import { logLevelPattern }         from "../internal/patterns.js";
import Tasks                       from "../internal/tasks.js";
import createProgram               from "./create-program.js";

const program = createProgram()
    .option("--host              <n>", "Dev server hostname.")
    .option("--hot               [n]", "Dev server port.", toBoolean)
    .option("--log-level         <n>", "Dev server port.", parsePattern(logLevelPattern))
    .option("--port              <n>", "Dev server port.", Number)
    .action((command: Command) => void Tasks.serve(command.opts()));

program.parse(process.argv);