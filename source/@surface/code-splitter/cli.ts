#!/usr/bin/env node
import commander    from "commander";
import CodeSplitter from ".";

commander
    .version("0.0.1")
    .option("-c, --context <path>", "Context path")
    .option("-e, --entries <paths>", "Entry files or directories", files => files.split(","))
    .option("-o, --output  <path>", "Output path")
    .parse(process.argv);

CodeSplitter.execute({ context: commander.context, entries: commander.entries, output: commander.output });