import Publisher,
{
    type BumpOptions,
    type ChangedOptions,
    type Options,
    type PublishOptions,
    type UnpublishOptions,
    type Version,
} from "./publisher.js";

/* c8 ignore start */

export default class Commands
{
    public static async bump(version: Version, preid?: string, build?: string, options: Options & BumpOptions = { }): Promise<void>
    {
        // Enforce test
        const bumpOptions: Required<BumpOptions> =
        {
            changelog:            options.changelog!,
            commit:               options.commit!,
            createRelease:        options.createRelease!,
            force:                options.force!,
            ignoreChanges:        options.ignoreChanges!,
            independent:          options.independent!,
            pushToRemote:         options.pushToRemote!,
            remote:               options.remote!,
            synchronize:          options.synchronize!,
            tag:                  options.tag!,
            updateFileReferences: options.updateFileReferences!,
            includePrivate:       options.includePrivate!,
        };

        await new Publisher(options).bump(version, preid, build, bumpOptions);
    }

    public static async changed(options: Options & ChangedOptions = { }): Promise<void>
    {
        // Enforce test
        const changedOptions: Required<ChangedOptions> =
        {
            ignoreChanges:  options.ignoreChanges!,
            includePrivate: options.includePrivate!,
            tag:            options.tag!,
        };

        const changes = await new Publisher(options).changed(changedOptions);

        console.log(changes.length > 0 ? `Packages with changes:\n${changes.join("\n")}` : "No changes detected!");
    }

    public static async publish(options: Options & PublishOptions = { }): Promise<void>
    {
        // Enforce test
        const publishOptions: Required<PublishOptions> =
        {
            build:                options.build!,
            canary:               options.canary!,
            force:                options.force!,
            ignoreChanges:        options.ignoreChanges!,
            includePrivate:       options.includePrivate!,
            preid:                options.preid!,
            prereleaseType:       options.prereleaseType!,
            synchronize:          options.synchronize!,
            tag:                  options.tag!,
        };

        await new Publisher(options).publish(publishOptions);
    }

    public static async unpublish(options: Options & UnpublishOptions = { }): Promise<void>
    {
        // Enforce test
        const unpublishOptions: Required<UnpublishOptions> =
        {
            includePrivate: options.includePrivate!,
        };

        await new Publisher(options).unpublish(unpublishOptions);
    }
}

/* c8 ignore stop */
