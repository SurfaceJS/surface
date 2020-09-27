#!/usr/bin/env node

import { Command } from "commander";
import
{
    logLevelPattern,
    modePattern,
    parsePattern,
    toBoolean,
} from "../common";
import Tasks         from "../tasks";
import createProgram from ".";

const program = createProgram()
    .option("--hot               [n]", "Enable hot module reload.", toBoolean)
    .option("--log-level         <n>", "Output verbosity level. Can be 'errors-only', 'minimal', 'none', 'normal', 'verbose'.", parsePattern(logLevelPattern))
    .option("--mode              <n>", "Enable production optimizations or development hints.", parsePattern(modePattern))
    .option("--watch             [n]", "Enable Watch mode compilation.", toBoolean)
    .action((command: Command) => void Tasks.build(command.opts()));

program.parse(process.argv);