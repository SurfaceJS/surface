import type { ReleaseType }                      from "semver";
import type { BumpOptions }                      from "./publisher.js";
import Publisher, { type Options, type Version } from "./publisher.js";

type CliBumpOptions    = Options & BumpOptions;
type CliPublishOptions = Options &
{
    canary?:      boolean,
    preid?:       string,
    releaseType?: ReleaseType,
    sequence?:    string,
};

export default class Commands
{
    public static async bump(version: Version, identifier?: string, options: CliBumpOptions = { }): Promise<void>
    {
        const bumpOptions =
        {
            independent:          options.independent,
            synchronize:          options.synchronize,
            updateFileReferences: options.updateFileReferences,
        };

        await new Publisher(options).bump(version, identifier, bumpOptions);
    }

    public static async publish(tag: string = "latest", options: CliPublishOptions = { }): Promise<void>
    {
        await new Publisher(options).publish(tag, options.canary, options.releaseType, options.preid, options.sequence);
    }

    public static async unpublish(tag: string = "latest", options: Options = { }): Promise<void>
    {
        await new Publisher(options).unpublish(tag);
    }
}
