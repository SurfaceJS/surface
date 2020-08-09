#!/usr/bin/env node
import { Command } from "commander";
import Tasks       from "./internal/tasks";

const program = new Command();

const enviromentModePattern = /^(development|none|production)$/i;
const statsLevelPattern     = /^errors-only|minimal|none|normal|verbose$/i;
const booleanPattern        = /^true|false$/i;

function toBooleanOrStringArray(value: string): boolean | string[]
{
    return !value
        ? false
        : booleanPattern.test(value)
            ? value.toLowerCase() == "true"
            : value.split(",");
}

function toBoolean(value: string): boolean
{
    return !value
        ? false
        : booleanPattern.test(value)
            ? value.toLowerCase() == "true"
            : false;
}

program.version("1.0.0");

program
    .command("build")
    .option("-c|--context         <context>",       "The base directory for resolving the entry option (absolute path)")
    .option("-e|--entry           <entry>",         "Entry points", (x = "") => x.split(","))
    .option("-ft|--force-ts       <forceTs>",       "Force resolve to the ts file when next to the transpiled js file", toBooleanOrStringArray)
    .option("-f|--filename        <filename>",      "The filename of the entry chunk as relative path inside the output.path directory")
    .option("-l|--log-level       <logLevel>",      "Output verbosity level", x => statsLevelPattern.test(x) && x.toLowerCase())
    .option("-m|--mode            <mode>",          "Enable production optimizations or development hints.", x => enviromentModePattern.test(x) && x.toLowerCase())
    .option("-o|--output          <output>",        "The output directory (absolute path)")
    .option("-pp|--public-path    <publicPath>",    "Include comments with information about the modules")
    .option("-p|--project         <project>",       "Path to project file (absolute path)")
    .option("-tc|--tsconfig       <tsconfig>",      "Path to tsconfig file (relative to context)")
    .option("-tl|--tslint         <tslint>",        "Path to tslint file (relative to context)")
    .option("-t|--html-template   <htmlTemplate>",  "Path to html template file (relative to context)")
    .option("-wc|--webpack-config <webpackConfig>", "Path to webpack-config file (relative to context)")
    .option("-w|--watch           <watch>",         "Watch mode compilation", toBoolean)
    .action(Tasks.build);

program
    .command("clean")
    .option("-o|--output  <output>",  "The output directory (absolute path)")
    .option("-p|--project <project>", "Path to project file (absolute path)")
    .action(Tasks.clean);

program.parse(process.argv);