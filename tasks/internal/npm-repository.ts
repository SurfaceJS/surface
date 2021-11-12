import { Version }       from "@surface/core";
import libnpmpublish     from "libnpmpublish";
import type { Manifest } from "pacote";
import pacote            from "pacote";
import { log }           from "./common.js";
import Status            from "./enums/status.js";

export default class NpmRepository
{
    public constructor(private readonly token?: string)
    {

    }

    public async publish(manifest: Manifest, buffer: Buffer, tag: string = "latest"): Promise<void>
    {
        const response = await libnpmpublish.publish(manifest, buffer, { access: "public", defaultTag: tag, forceAuth: { token: this.token } });

        if (!response.ok)
        {
            log(`Error publishing package ${manifest.name}`);
        }
    }

    public async addTag(_manifest: Manifest): Promise<void>
    {
        await Promise.resolve();
    }

    public async get(uri: string): Promise<Manifest | null>
    {
        try
        {
            return await pacote.manifest(uri, { alwaysAuth: true });
        }
        catch (error)
        {
            return null;
        }
    }

    public async getStatus(manifest: Manifest): Promise<Status>
    {
        const latest = await this.get(`${manifest.name}@latest`);

        if (latest)
        {
            if (Version.compare(Version.parse(manifest.version), Version.parse(latest.version)) == 1)
            {
                return Status.Updated;
            }

            return Status.InRegistry;
        }

        return Status.New;
    }
}