/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
import type { AsyncCallable, Delegate } from "@surface/core/internal/types/index.js";
import { LogLevel }                     from "@surface/logger";
import { Command }                      from "commander";
import Commands                         from "./commands.js";
import { toBoolean, toEnum, toSemver }  from "./common.js";

/* cSpell:ignore preid, premajor, preminor, prepatch */

function apply(action: AsyncCallable, program: Command, ...configs: Delegate<[Command], Command>[]): void
{
    for (const config of configs)
    {
        program = config(program);
    }

    program.action(async (...args: unknown[]) => action(...args.slice(0, args.length - 1)));
}

function ignoreChangesOptions(program: Command): Command
{
    return program
        .option("--ignore-changes         <n...>", "Files to ignore when detecting changes");
}

function globalOptions(program: Command): Command
{
    return program
        .option("--packages               <n...>", "Packages or workspaces to include")
        .option("--registry               <n>", "Registry from where packages will be unpublished")
        .option("--token                  <n>", "Token used to authenticate")
        .option("--cwd                    <n>", "Working dir")
        .option("--dry                    [n]", "Enables dry run", toBoolean)
        .option("--log-level              <n>", "Log level", toEnum(...Object.entries(LogLevel)), "info");
}

function restrictionOptions(program: Command): Command
{
    return program
        .option("--include-private        <n>", "Includes private packages when publishing or unpublishing", toBoolean)
        .option("--include-workspace-root [n]", "Includes workspaces root when publishing or unpublishing", toBoolean);
}

export default async function main(args: string[]): Promise<void>
{
    const program = new Command();

    program
        .name("publisher")
        .version("1.0.0");

    const bump = program
        .command("bump")
        .description("Bump discovered packages or workspaces using provided custom version")
        .argument("<version>", "An semantic version or an release type: major, minor, patch, premajor, preminor, prepatch, prerelease. Also can accept an glob prerelease '*-dev+123' to override just the prerelease part of the version. Useful for canary builds.", toSemver)
        .argument("[preid]", "The 'prerelease identifier' to use as a prefix for the 'prerelease' part of a semver. Like the rc in 1.2.0-rc.8")
        .option("--tag                    <n>", "Tag used to compare local and remote packages")
        .option("--force                  [n]", "Bump packages with no changes", toBoolean)
        .option("--independent            [n]", "Ignore workspace root version and bump itself", toBoolean)
        .option("--synchronize            [n]", "Synchronize dependencies between workspace packages after bumping", toBoolean)
        .option("--update-file-references [n]", "Update file references when bumping", toBoolean);

    apply(Commands.bump, bump, globalOptions, ignoreChangesOptions);

    const changed = program
        .command("changed")
        .description("List local packages that have changed compared to remote tagged package.")
        .argument("[tag]", "Dist tag used to compare local and remote packages");

    apply(Commands.changed, changed, globalOptions, ignoreChangesOptions, restrictionOptions);

    const publish = program
        .command("publish")
        .description("Publish packages or workspaces packages")
        .argument("[tag]", "Tag to publish")
        .option("--synchronize            [n]", "Synchronize dependencies between workspace packages before publishing", toBoolean)
        .option("--canary                 [n]", "Enables canary release", toBoolean)
        .option("--prerelease-type        <n>", "An prerelease type: premajor, preminor, prepatch, prerelease", toEnum("premajor", "preminor", "prepatch", "prerelease"))
        .option("--identifier             <n>", "The \"prerelease identifier\" to use as a prefix for the \"prerelease\" part of a semver. Used by canary.")
        .option("--force                  <n>", "Forces to publish unchanged packages. Used by canary", toBoolean);

    apply(Commands.publish, publish, globalOptions, ignoreChangesOptions, restrictionOptions);

    const unpublish = program
        .command("unpublish")
        .description("Unpublish packages or workspaces packages")
        .argument("[tag]", "Tag to unpublish");

    apply(Commands.unpublish, unpublish, globalOptions, restrictionOptions);

    await program.parseAsync(args);
}
