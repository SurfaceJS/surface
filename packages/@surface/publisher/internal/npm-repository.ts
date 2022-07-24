import libnpmpublish     from "libnpmpublish";
import type { Manifest } from "pacote";
import pacote            from "pacote";
import semver            from "semver";
import Status            from "./enums/status.js";

export default class NpmRepository
{
    public constructor(private readonly registry?: string, private readonly token?: string)
    { }

    public async get(uri: string): Promise<Manifest | null>
    {
        try
        {
            return await pacote.manifest(uri, { registry: this.registry, alwaysAuth: true });
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
            if (semver.gt(manifest.version, latest.version))
            {
                return Status.Updated;
            }

            return Status.InRegistry;
        }

        return Status.New;
    }

    public async publish(manifest: Manifest, buffer: Buffer, tag: string = "latest"): Promise<void>
    {
        const response = await libnpmpublish.publish(manifest, buffer, { registry: this.registry, access: "public", defaultTag: tag, forceAuth: { token: this.token } });

        if (!response.ok)
        {
            throw new Error(`Error publishing package ${manifest.name}`);
        }
    }
}
