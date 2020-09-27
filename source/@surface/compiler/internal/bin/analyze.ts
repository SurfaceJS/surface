#!/usr/bin/env node

import { Command } from "commander";
import
{
    analyzerDefaultSizesPattern,
    analyzerLogLevelPattern,
    analyzerModePattern,
    modePattern,
    parsePattern,
    toArray,
    toBoolean,
} from "../common";
import Tasks         from "../tasks";
import createProgram from ".";

const program = createProgram()
    .option("--analyzer-mode     <n>", "Analyzer Mode: server, static, json, disabled.", parsePattern(analyzerModePattern))
    .option("--default-sizes     <n>", "Module sizes to show in report by default. Should be one of 'stat', 'parsed' or 'gzip'.", parsePattern(analyzerDefaultSizesPattern))
    .option("--exclude           <n>", "Patterns that will be used to match against asset names to exclude them from the report.", toArray)
    .option("--host              <n>", "Host that will be used in server mode to start HTTP server.")
    .option("--log-level         <n>", "Log level. Can be 'info', 'warn', 'error' or 'silent'.", parsePattern(analyzerLogLevelPattern))
    .option("--mode              <n>", "Enable production optimizations or development hints.", parsePattern(modePattern))
    .option("--open              <n>", "Automatically open report in default browser.", toBoolean)
    .option("--port              <n>", "Port that will be used in server mode to start HTTP server.", x => x == "auto" ? x : Number(x))
    .option("--report-filename   <n>", "Path to bundle report file that will be generated in static mode.")
    .action((command: Command) => void Tasks.analyze(command.opts()));

program.parse(process.argv);