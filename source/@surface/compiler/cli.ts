#!/usr/bin/env node

import path                              from "path";
import type { ExecutableCommandOptions } from "commander";
import { Command }                       from "commander";

function createCommandOptions(target: string): ExecutableCommandOptions
{
    return { executableFile: path.resolve(__dirname, `./bin/${target}.js`) };
}

const program = new Command();

program.command("analyze [options]", "Analyze bundle size.", createCommandOptions("analyze")).alias("a");
program.command("build   [options]", "Compile project.",     createCommandOptions("build")).alias("b");
program.command("serve   [options]", "Starts dev server.",   createCommandOptions("serve")).alias("s");

program.parse(process.argv);