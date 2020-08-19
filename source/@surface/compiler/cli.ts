#!/usr/bin/env node

import path        from "path";
import { Command } from "commander";

const program = new Command();

const getBin = (target: string): string => path.resolve(__dirname, `./bin/${target}.js`);

program.command("analyze [options]", "Analize bundle size",          { executableFile: getBin("analyze") }).alias("a");
program.command("build   [options]", "Build packages",               { executableFile: getBin("build") }).alias("b");
program.command("clean   [options]", "Remove compilation artifacts", { executableFile: getBin("clean") }).alias("c");
program.command("serve   [options]", "Starts dev server",            { executableFile: getBin("serve") }).alias("s");

program.parse(process.argv);