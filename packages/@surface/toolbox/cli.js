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
    .option("--dry       [n]", "Enables dry run", toBoolean)
    .option("--log-level <n>", "Log level", toEnum(...Object.entries(LogLevel)), LogLevel.Info)
    .action(Commands.bump);
program
    .command("publish")
    .description("Publish discovered packages")
    .argument("[tag]")
    .requiredOption("--packages  <n...>", "Packages to publish")
    .option("--dry       [n]", "Enables dry run", toBoolean)
    .option("--log-level <n>", "Log level", toEnum(...Object.entries(LogLevel)), LogLevel.Info)
    .option("--registry  <n>", "Npm registry where packages will be published")
    .option("--token     <n>", "Npm token used to publish")
    .option("--canary    [n]", "Enables canary release", toBoolean)
    .action(Commands.publish);
program
    .command("unpublish")
    .description("Unpublish discovered packages")
    .argument("[tag]")
    .requiredOption("--packages  <n...>", "Packages to publish")
    .option("--dry       [n]", "Enables dry run", toBoolean)
    .option("--log-level <n>", "Log level", toEnum(...Object.entries(LogLevel)), LogLevel.Info)
    .option("--registry  <n>", "Npm registry where packages will be published")
    .option("--token     <n>", "Npm token used to publish")
    .action(Commands.unpublish);
program.parse();
//# sourceMappingURL=cli.js.map