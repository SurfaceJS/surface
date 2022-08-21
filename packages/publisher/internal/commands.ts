import Publisher,
{
    type BumpOptions,
    type Options,
    type PublishOptions,
    type UnpublishOptions,
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

    public static async publish(tag: string = "latest", options: Options & PublishOptions = { }): Promise<void>
    {
        const publishOptions: PublishOptions =
        {
            canary:         options.canary,
            identifier:     options.identifier,
            registry:       options.registry,
            prereleaseType: options.prereleaseType,
            sequence:       options.sequence,
            token:          options.token,
        };

        await new Publisher(options).publish(tag, publishOptions);
    }

    public static async unpublish(tag: string = "latest", options: Options & UnpublishOptions = { }): Promise<void>
    {
        const unpublishOptions: UnpublishOptions =
        {
            registry: options.registry,
            token:    options.token,
        };

        await new Publisher(options).unpublish(tag, unpublishOptions);
    }
}
