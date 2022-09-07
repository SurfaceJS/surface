import Publisher,
{
    type BumpOptions,
    type Options,
    type PublishOptions,
    type Version,
} from "./publisher.js";

export default class Commands
{
    public static async bump(version: Version, identifier?: string, options: Options & BumpOptions = { }): Promise<void>
    {
        const bumpOptions: BumpOptions =
        {
            independent:          options.independent,
            synchronize:          options.synchronize,
            updateFileReferences: options.updateFileReferences,
        };

        await new Publisher(options).bump(version, identifier, bumpOptions);
    }

    public static async changed(tag: string = "latest", options: Options = { }): Promise<void>
    {
        const changes = await new Publisher(options).changed(tag);

        console.log(changes.length > 0 ? `Packages with changes:\n${changes.join("\n")}` : "No changes detected!");
    }

    public static async publish(tag?: string, options: Options & PublishOptions = { }): Promise<void>
    {
        const publishOptions: PublishOptions =
        {
            canary:         options.canary,
            identifier:     options.identifier,
            prereleaseType: options.prereleaseType,
            sequence:       options.sequence,
        };

        await new Publisher(options).publish(tag ?? options.canary ? "next" : "latest", publishOptions);
    }

    public static async unpublish(tag: string = "latest", options: Options = { }): Promise<void>
    {
        await new Publisher(options).unpublish(tag);
    }
}
