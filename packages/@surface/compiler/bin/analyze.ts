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
    .option("--analyzer-host            <n>", "Host that will be used in server mode to start HTTP server.")
    .option("--analyzer-mode            <n>", "Analyzer Mode. Should be one of server, static, json, disabled.", parsePattern(analyzerModePattern))
    .option("--analyzer-port            <n>", "Port that will be used in server mode to start HTTP server.", x => x == "auto" ? x : Number(x))
    .option("--default-sizes            <n>", "Module sizes to show in report by default. Should be one of 'stat', 'parsed' or 'gzip'.", parsePattern(analyzerDefaultSizesPattern))
    .option("--exclude-assets           <n>", "Patterns that will be used to match against asset names to exclude them from the report.", toArray)
    .option("--mode                     <n>", "Enable production optimizations or development hints.", parsePattern(modePattern))
    .option("--open-analyzer            <n>", "Automatically open report in default browser.", toBoolean)
    .option("--report-filename          <n>", "Path to bundle report file that will be generated in static mode.")
    .option("--report-title             <n>", "Content of the HTML title element.")
    .action(x => void Tasks.analyze(x));

program.parse(process.argv);