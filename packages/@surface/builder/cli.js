#!/usr/bin/env node
import path from "path";
import { fileURLToPath } from "url";
import { Command } from "commander";
const dirname = path.dirname(fileURLToPath(import.meta.url));
function createCommandOptions(target) {
    return { executableFile: path.resolve(dirname, `./bin/${target}.js`) };
}
const program = new Command();
program.command("analyze [options]", "Analyze bundle size.", createCommandOptions("analyze")).alias("a");
program.command("build   [options]", "Build project.", createCommandOptions("build")).alias("b");
program.command("serve   [options]", "Starts dev server.", createCommandOptions("serve")).alias("s");
program.parse();
//# sourceMappingURL=cli.js.map