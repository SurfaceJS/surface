#!/usr/bin/env node
import { LogLevel } from "@surface/logger";
import { Command } from "commander";
import Commands from "./internal/commands.js";
import { toBoolean, toEnum } from "./internal/common.js";
const program = new Command();
program
    .name("toolbox")
    .version("1.0.0");
// program
//     .command("cover <n>")
//     .action(Commands.cover);
// program
//     .command("test <n>")
//     .action(Commands.test);
program
    .command("bump")
    .description("Bump discovered packages using provided custom version")
    .argument("<release-type>")
    .argument("[identifier-or-version]")
    .requiredOption("--packages  <n...>", "Packages to bump")
    .option("--dry       [n]", "Dry run", toBoolean)
    .option("--log-level <n>", "Log level", toEnum(...Object.entries(LogLevel)), LogLevel.Info)
    .action(Commands.bump);
// program
//     .command("publish <registry>")
//     .requiredOption("--token <n>", "NPM token")
//     .option("--mode          <n>", "Configuration mode", toEnum("nightly", "release"))
//     .option("--dry           [n]", "Dry run", toBoolean)
//     .option("--timestamp     [n]", "Timestamp")
//     .action(Commands.canary);
// program
//     .command("publish <registry>")
//     .requiredOption("--token <n>", "NPM token")
//     .option("--mode          <n>", "Configuration mode", toEnum("nightly", "release"))
//     .option("--dry           [n]", "Dry run", toBoolean)
//     .option("--timestamp     [n]", "Timestamp")
//     .action(Commands.publish);
// program
//     .command("publish <registry>")
//     .requiredOption("--token <n>", "NPM token")
//     .option("--mode          <n>", "Configuration mode", toEnum("nightly", "release"))
//     .option("--dry           [n]", "Dry run", toBoolean)
//     .option("--timestamp     [n]", "Timestamp")
//     .action(Commands.release);
program.parse();
//# sourceMappingURL=cli.js.map