import Publisher,
{
    type BumpOptions,
    type ChangedOptions,
    type Options,
    type PublishOptions,
    type UnpublishOptions,
    type Version,
} from "./publisher.js";

export default class Commands
{
    public static async bump(version: Version, preid?: string, build?: string, options: Options & BumpOptions = { }): Promise<void>
    {
        const bumpOptions: BumpOptions =
        {
            independent:          options.independent,
            synchronize:          options.synchronize,
            updateFileReferences: options.updateFileReferences,
        };

        await new Publisher(options).bump(version, preid, build, bumpOptions);
    }

    public static async changed(tag: string = "latest", options: Options & ChangedOptions = { }): Promise<void>
    {
        const changes = await new Publisher(options).changed(tag, options);

        console.log(changes.length > 0 ? `Packages with changes:\n${changes.join("\n")}` : "No changes detected!");
    }

    public static async publish(tag: string = "latest", options: Options & PublishOptions = { }): Promise<void>
    {
        const publishOptions: PublishOptions =
        {
            canary:         options.canary,
            preid:          options.preid,
            prereleaseType: options.prereleaseType,
        };

        await new Publisher(options).publish(tag ?? options.canary ? "next" : "latest", publishOptions);
    }

    public static async unpublish(tag: string = "latest", options: Options & UnpublishOptions = { }): Promise<void>
    {
        await new Publisher(options).unpublish(tag);
    }
}
