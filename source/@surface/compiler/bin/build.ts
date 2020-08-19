#!/usr/bin/env node

import { Command } from "commander";
import
{
    logLevelPattern,
    modePattern,
    parsePattern,
    targetPattern,
    toBoolean,
} from "../internal/common";
import Tasks from "../internal/tasks";
import main  from "./main";

main
    .option("--hot               [n]", "Enable hot module reload.", toBoolean)
    .option("--log-level         <n>", "Output verbosity level. Can be 'errors-only', 'minimal', 'none', 'normal', 'verbose'.", parsePattern(logLevelPattern))
    .option("--mode              <n>", "Enable production optimizations or development hints.", parsePattern(modePattern))
    .option("--watch             [n]", "Enable Watch mode compilation", toBoolean)
    .option("--target            <n>", "Build target. Can be 'node', 'web'.", parsePattern(targetPattern))
    .action((command: Command) => Tasks.build(command.opts()));

main.parse(process.argv);