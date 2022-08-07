import type { ReleaseType }      from "semver";
import Toolbox, { type Options } from "./toolbox.js";

type TestOptions = { };

export default class Commands
{
    public static async bump(releaseType: ReleaseType | "custom", identifierOrVersion?: string, options: Options = { }): Promise<void>
    {
        await new Toolbox(options).bump(releaseType, identifierOrVersion);
    }

    public static async publish(tag: string = "latest", options: Options = { }): Promise<void>
    {
        await new Toolbox(options).publish(tag);
    }

    public static async unpublish(tag: string = "latest", options: Options = { }): Promise<void>
    {
        await new Toolbox(options).unpublish(tag);
    }

    public static async test(_options: TestOptions): Promise<void>
    {
        throw new Error("Method not implemented.");
    }
}
