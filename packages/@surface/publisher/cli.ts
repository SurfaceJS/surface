#!/usr/bin/env node
import { LogLevel }          from "@surface/logger";
import { Command }           from "commander";
import Commands              from "./internal/commands.js";
import { toBoolean, toEnum } from "./internal/common.js";

/* cSpell:ignore premajor, preminor, prepatch */

const program = new Command();

program
    .name("publisher")
    .version("1.0.0");

program
    .command("bump")
    .description("Bump discovered packages using provided custom version.")
    .argument("<release-type>", "Type of release.", toEnum("major", "minor", "patch", "premajor", "preminor", "prepatch", "prerelease", "custom"))
    .argument("[identifier-or-version]", "When release type is an prerelease, the value is used as identifier, When release type is custom, the value is used as version")
    .requiredOption("--packages  <n...>", "Packages to bump.")
    .option("--dry       [n]", "Enables dry run.", toBoolean)
    .option("--log-level <n>", "Log level.", toEnum(...Object.entries(LogLevel)), LogLevel.Info)
    .action(Commands.bump);

program
    .command("publish")
    .description("Publish discovered packages.")
    .argument("[tag]")
    .requiredOption("--packages  <n...>", "Packages to publish.")
    .option("--dry       [n]", "Enables dry run.", toBoolean)
    .option("--log-level <n>", "Log level.", toEnum(...Object.entries(LogLevel)), LogLevel.Info)
    .option("--registry  <n>", "Registry where packages will be published.")
    .option("--token     <n>", "Token used to authenticate.")
    .option("--canary    [n]", "Enables canary release.", toBoolean)
    .action(Commands.publish);

program
    .command("unpublish")
    .description("Unpublish discovered packages.")
    .argument("[tag]", "Tag used to publish.")
    .requiredOption("--packages  <n...>", "Packages to unpublish.")
    .option("--dry       [n]", "Enables dry run.", toBoolean)
    .option("--log-level <n>", "Log level.", toEnum(...Object.entries(LogLevel)), LogLevel.Info)
    .option("--registry  <n>", "Registry from where packages will be unpublished.")
    .option("--token     <n>", "Token used to authenticate.")
    .action(Commands.unpublish);

program.parse();
