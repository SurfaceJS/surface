/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
import type { AsyncCallable, Delegate } from "@surface/core/internal/types/index.js";
import { LogLevel }                     from "@surface/logger";
import chalk                            from "chalk";
import { Command }                      from "commander";
import Commands                         from "./commands.js";
import { toBoolean, toEnum, toSemver }  from "./common.js";

/* cSpell:ignore preid, premajor, preminor, prepatch */

function handler(action: AsyncCallable): AsyncCallable
{

    /* c8 ignore start */
    function errorHandler(error: Error): void
    {
        if (error instanceof AggregateError)
        {
            console.error(chalk.red(`${error.message}:\n  ${error.errors.map(x => (x as Error).message).join("\n  ")}`));
        }
        else
        {
            console.error(chalk.red(error.message));
        }

        process.exit(1);
    }

    /* c8 ignore stop */

    return async (...args: unknown[]): Promise<unknown> =>
        action(...args.slice(0, args.length - 1)).catch(errorHandler);
}

function apply(action: AsyncCallable, program: Command, ...configs: Delegate<[Command], Command>[]): void
{
    for (const config of configs)
    {
        program = config(program);
    }

    program.action(handler(action));
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
        .option("--log-level              <n>", "Log level", toEnum(...Object.entries(LogLevel)), LogLevel.Info);
}

function restrictionOptions(program: Command): Command
{
    return program
        .option("--include-private        <n>", "Includes private packages", toBoolean)
        .option("--include-workspace-root [n]", "Includes workspaces root", toBoolean);
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
        .argument("[preid]", "The 'prerelease identifier' part of a semver. Like the \"rc\" in 1.2.0-rc.8+2022")
        .argument("[build]", "The build part of a semver. Like the \"2022\" in 1.2.0-rc.8+2022")
        .option("--tag                    <n>", "Tag used to compare local and remote packages")
        .option("--force                  [n]", "Bump packages with no changes", toBoolean)
        .option("--independent            [n]", "Ignore workspace root version and bump itself", toBoolean)
        .option("--synchronize            [n]", "Synchronize dependencies between workspace packages after bumping", toBoolean)
        .option("--update-file-references [n]", "Update file references when bumping", toBoolean)
        .option("--changelog              [n]", "Writes changelog file after bumping", toBoolean)
        .option("--commit                 [n]", "Commit changes", toBoolean)
        .option("--push-to-remote         [n]", "Push commit to remote", toBoolean)
        .option("--remote                 [n]", "Git remote")
        .option("--create-release         <n>", "Creates a github or gitlab release with the generated changes.", toEnum("github", "gitlab"));

    apply(Commands.bump, bump, globalOptions, ignoreChangesOptions);

    const changed = program
        .command("changed")
        .description("List local packages that have changed compared to remote tagged package.")
        .option("--tag                    <n>", "Dist tag used to compare local and remote packages");

    apply(Commands.changed, changed, globalOptions, ignoreChangesOptions, restrictionOptions);

    const publish = program
        .command("publish")
        .description("Publish packages or workspaces packages")
        .option("--tag                    <n>", "Tag to publish")
        .option("--synchronize            [n]", "Synchronize dependencies between workspace packages before publishing", toBoolean)
        .option("--canary                 [n]", "Enables canary release", toBoolean)
        .option("--prerelease-type        <n>", "An prerelease type: premajor, preminor, prepatch, prerelease. Used by canary", toEnum("premajor", "preminor", "prepatch", "prerelease"))
        .option("--preid                  <n>", "The 'prerelease identifier' part of a semver. Like the \"rc\" in 1.2.0-rc.8+2022. Used by canary")
        .option("--build                  <n>", "The build part of a semver. Like the \"2022\" in 1.2.0-rc.8+2022. Used by canary")
        .option("--force                  [n]", "Forces to publish unchanged packages. Used by canary", toBoolean);

    apply(Commands.publish, publish, globalOptions, ignoreChangesOptions, restrictionOptions);

    const unpublish = program
        .command("unpublish")
        .description("Unpublish packages or workspaces packages");

    apply(Commands.unpublish, unpublish, globalOptions, restrictionOptions);

    await program.parseAsync(args);
}
