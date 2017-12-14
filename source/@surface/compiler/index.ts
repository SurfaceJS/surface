#!/usr/bin/env node
import * as tasks     from "./tasks";
import * as commander from "commander";

commander
    .version("0.0.1")
    .option("-c, --config <n>", "Configuration file path")
    .option("-e, --env    <n>", "Enviroment mode", /^(debug|release)$/i)
    .option("-t, --task   <n>", "Task to be executed", /^build|clean|rebuild$/i, "build")
    .option("-w, --watch"     , "Watch mode compilation", /true|false/i)
    .parse(process.argv);

tasks.execute(commander.task, commander.config, commander.env, commander.watch);