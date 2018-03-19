#!/usr/bin/env node
import commander  from "commander";
import * as tasks from "./tasks";

commander
    .version("0.0.1")
    .option("-c, --config      <n>", "Configuration file path")
    .option("-e, --env         <n>", "Enviroment mode", /^(development|production)$/i)
    .option("-s, --stats-level <n>", "Output verbosity level", /^errors-only|minimal|none|normal|verbose$/i, "build")
    .option("-t, --task        <n>", "Task to be executed", /^build|clean|rebuild$/i, "build")
    .option("-w, --watch"          , "Watch mode compilation", /true|false/i)
    .parse(process.argv);

tasks.execute(commander.task, commander.config, commander.env, commander.watch, commander.statsLevel);