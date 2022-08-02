import type { ReleaseType }      from "semver";
import { isPrerelease }          from "./common.js";
import Toolbox, { type Options } from "./toolbox.js";

type TestOptions = { };

export default class Commands
{
    public static async bump(releaseType: ReleaseType | "custom", identifierOrVersion?: string, options: Options = { }): Promise<void>
    {
        const publisher = new Toolbox(options);

        if (releaseType == "custom")
        {
            await publisher.bump(releaseType, identifierOrVersion);
        }
        else if (!isPrerelease(releaseType))
        {
            await publisher.bump(releaseType);
        }
        else
        {
            await publisher.bump(releaseType, identifierOrVersion);
        }
    }

    public static async canary(_options: Options): Promise<void>
    {
        throw new Error("Method not implemented.");
    }

    public static async cover(_options: Options): Promise<void>
    {
        throw new Error("Method not implemented.");
    }

    public static async publish(_options: Options): Promise<void>
    {
        throw new Error("Method not implemented.");
    }

    public static async release(_options: Options): Promise<void>
    {
        throw new Error("Method not implemented.");
    }

    public static async test(_options: TestOptions): Promise<void>
    {
        throw new Error("Method not implemented.");
    }
}
