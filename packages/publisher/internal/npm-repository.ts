import type { PackageJson } from "@npm/types";
import libnpmpublish        from "libnpmpublish";
import pacote               from "pacote";
import semver               from "semver";
import Status               from "./enums/status.js";
import type { Auth }        from "./npm-config.js";

export default class NpmRepository
{
    public constructor(private readonly auth: Auth = { })
    { }

    public async get(spec: string): Promise<ReturnType<typeof pacote["manifest"]> | null>
    {
        try
        {
            return await pacote.manifest(spec, { registry: this.auth.registry, alwaysAuth: true });
        }
        catch (error)
        {
            return null;
        }
    }

    public async getStatus(manifest: PackageJson): Promise<Status>
    {
        const latest = await this.get(`${manifest.name}@${manifest.version}`);

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

    public async publish(manifest: PackageJson, buffer: Buffer, tag: string = "latest"): Promise<void>
    {
        const response = await libnpmpublish.publish(manifest, buffer, { registry: this.auth?.registry, access: "public", defaultTag: tag, forceAuth: { token: this.auth?.token } });

        if (!response.ok)
        {
            throw new Error(`Failed to publish package ${manifest.name}`);
        }
    }

    public async unpublish(manifest: PackageJson, tag: string = "latest"): Promise<void>
    {
        const response = await libnpmpublish.unpublish(manifest, { registry: this.auth?.registry, access: "public", defaultTag: tag, forceAuth: { token: this.auth?.token } });

        if (!response)
        {
            throw new Error(`Failed to unpublish package ${manifest.name}`);
        }
    }
}
