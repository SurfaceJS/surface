#!/usr/bin/env node

import
{
    parsePattern,
    toArray,
    toBoolean,
} from "../internal/common.js";
import
{
    analyzerDefaultSizesPattern,
    analyzerModePattern,
    modePattern,
} from "../internal/patterns.js";
import Tasks         from "../internal/tasks.js";
import createProgram from "./create-program.js";

const program = createProgram()
    .option("--analyzer-mode     <n>", "Analyzer Mode: server, static, json, disabled.", parsePattern(analyzerModePattern))
    .option("--default-sizes     <n>", "Module sizes to show in report by default. Should be one of 'stat', 'parsed' or 'gzip'.", parsePattern(analyzerDefaultSizesPattern))
    .option("--exclude           <n>", "Patterns that will be used to match against asset names to exclude them from the report.", toArray)
    .option("--host              <n>", "Host that will be used in server mode to start HTTP server.")
    .option("--mode              <n>", "Enable production optimizations or development hints.", parsePattern(modePattern))
    .option("--open              <n>", "Automatically open report in default browser.", toBoolean)
    .option("--port              <n>", "Port that will be used in server mode to start HTTP server.", x => x == "auto" ? x : Number(x))
    .option("--report-filename   <n>", "Path to bundle report file that will be generated in static mode.")
    .action(x => void Tasks.analyze(x));

program.parse(process.argv);