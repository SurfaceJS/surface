#!/usr/bin/env node
import { LogLevel } from "@surface/logger";
import { Command } from "commander";
import Commands from "./internal/commands.js";
import { toBoolean, toEnum } from "./internal/common.js";
/* cSpell:ignore premajor, preminor, prepatch */
const program = new Command();
program
    .name("publisher")
    .version("1.0.0");
program
    .command("bump")
    .description("Bump discovered packages or workspaces using provided custom version")
    .argument("<release-type>", "Type of release", toEnum("major", "minor", "patch", "premajor", "preminor", "prepatch", "prerelease", "custom"))
    .argument("[identifier-or-version]", "When release type is an prerelease, the value is used as identifier, When release type is custom, the value is used as version")
    .option("--packages                <n...>", "Packages or workspaces to bump")
    .option("--include-privates        <n>", "Include private packages when bumping or publishing", toBoolean)
    .option("--include-workspaces-root <n>", "Include workspaces root when bumping or publishing", toBoolean)
    .option("--independent-version     <n>", "Ignore workspace version and bump itself", toBoolean)
    .option("--update-file-references  <n>", "Update file references when bumping", toBoolean)
    .option("--cwd                     <n>", "Working dir")
    .option("--dry                     [n]", "Enables dry run", toBoolean)
    .option("--log-level               <n>", "Log level", toEnum(...Object.entries(LogLevel)), "info")
    .action(Commands.bump);
program
    .command("publish")
    .description("Publish packages or workspaces packages")
    .argument("[tag]", "Tag that will to publish")
    .option("--packages                <n...>", "Packages or workspaces to publish")
    .option("--registry                <n>", "Registry where packages will be published")
    .option("--token                   <n>", "Token used to authenticate")
    .option("--canary                  [n]", "Enables canary release", toBoolean)
    .option("--include-privates        <n>", "Include private packages when bumping or publishing", toBoolean)
    .option("--include-workspaces-root <n>", "Include workspaces root when bumping or publishing", toBoolean)
    .option("--independent-version     <n>", "Ignore workspace version and bump itself", toBoolean)
    .option("--update-file-references  <n>", "Update file references when bumping", toBoolean)
    .option("--cwd                     <n>", "Working dir")
    .option("--dry                     [n]", "Enables dry run", toBoolean)
    .option("--log-level               <n>", "Log level", toEnum(...Object.entries(LogLevel)), "info")
    .action(Commands.publish);
program
    .command("unpublish")
    .description("Unpublish packages or workspaces packages")
    .argument("[tag]", "Tag that will to unpublish")
    .option("--packages                <n...>", "Packages or workspaces to unpublish")
    .option("--registry                <n>", "Registry from where packages will be unpublished")
    .option("--token                   <n>", "Token used to authenticate")
    .option("--include-privates        <n>", "Include private packages when bumping or publishing", toBoolean)
    .option("--include-workspaces-root <n>", "Include workspaces root when bumping or publishing", toBoolean)
    .option("--independent-version     <n>", "Ignore workspace version and bump itself", toBoolean)
    .option("--update-file-references  <n>", "Update file references when bumping", toBoolean)
    .option("--cwd                     <n>", "Working dir")
    .option("--dry                     [n]", "Enables dry run", toBoolean)
    .option("--log-level               <n>", "Log level", toEnum(...Object.entries(LogLevel)), "info")
    .action(Commands.unpublish);
program.parse();
//# sourceMappingURL=cli.js.map