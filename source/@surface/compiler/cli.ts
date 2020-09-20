#!/usr/bin/env node

import path                                  from "path";
import { Command, ExecutableCommandOptions } from "commander";

function createCommandOptions(target: string): ExecutableCommandOptions
{
    return { executableFile: path.resolve(__dirname, `./internal/bin/${target}.js`) };
}

const program = new Command();

program.command("analyze [options]", "Analize bundle size",          createCommandOptions("analyze")).alias("a");
program.command("build   [options]", "Build packages",               createCommandOptions("build")).alias("b");
program.command("clean   [options]", "Remove compilation artifacts", createCommandOptions("clean")).alias("c");
program.command("serve   [options]", "Starts dev server",            createCommandOptions("serve")).alias("s");

program.parse(process.argv);