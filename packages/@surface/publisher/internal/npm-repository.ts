import libnpmpublish     from "libnpmpublish";
import type { Manifest } from "pacote";
import pacote            from "pacote";
import semver            from "semver";
import Status            from "./enums/status.js";
import type { Auth }     from "./npm-config.js";

export default class NpmRepository
{
    public async get(spec: string, registry?: string): Promise<Manifest | null>
    {
        try
        {
            return await pacote.manifest(spec, { registry, alwaysAuth: true });
        }
        catch (error)
        {
            return null;
        }
    }

    public async getStatus(manifest: Manifest, registry?: string): Promise<Status>
    {
        const latest = await this.get(`${manifest.name}@${manifest.version}`, registry);

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

    public async publish(manifest: Manifest, buffer: Buffer, auth?: Auth, tag: string = "latest"): Promise<void>
    {
        const response = await libnpmpublish.publish(manifest, buffer, { registry: auth?.registry, access: "public", defaultTag: tag, forceAuth: { token: auth?.token } });

        if (!response.ok)
        {
            throw new Error(`Failed to publish package ${manifest.name}`);
        }
    }

    public async unpublish(manifest: Manifest, auth?: Auth, tag: string = "latest"): Promise<void>
    {
        const response = await libnpmpublish.unpublish(manifest, { registry: auth?.registry, access: "public", defaultTag: tag, forceAuth: { token: auth?.token } });

        if (!response)
        {
            throw new Error(`Failed to unpublish package ${manifest.name}`);
        }
    }
}
