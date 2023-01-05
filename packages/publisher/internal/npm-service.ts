import type { PackageJson }     from "@npm/types";
import { deepEqual, typeGuard } from "@surface/core";
import PathMatcher              from "@surface/path-matcher";
import pack                     from "libnpmpack";
import libnpmpublish            from "libnpmpublish";
import pacote                   from "pacote";
import { untar }                from "./common.js";

// cSpell:ignore ETARGET

type HasChangesOptions = { ignorePackageVersion?: boolean, ignoreFiles?: string[] };

function stripSourceMap(source: string | undefined): string | undefined
{
    return source?.replace(/(?:\r)|(?:\/\/#\s+sourceMappingURL=.*$)/g, "").trim();
}

function stripFileReferences(left: PackageJson, right: PackageJson, dependencyType?: "dependencies" | "devDependencies" | "peerDependencies"): void
{
    if (dependencyType)
    {
        if (left[dependencyType] && right[dependencyType])
        {
            for (const [key, value] of Object.entries(left[dependencyType]!))
            {
                if (value.startsWith("file:"))
                {
                    right[dependencyType]![key] = value;
                }
            }
        }
    }
    else
    {
        stripFileReferences(left, right, "dependencies");
        stripFileReferences(left, right, "devDependencies");
        stripFileReferences(left, right, "peerDependencies");
    }
}

export default class NpmService
{
    public constructor(private readonly registry?: string, private readonly token?: string)
    { }

    private async getTarball(spec: string): Promise<Buffer | null>
    {
        try
        {
            return await pacote.tarball(spec, { registry: this.registry, token: this.token });
        }
        catch
        {
            return null;
        }
    }

    public async get(spec: string): Promise<Awaited<ReturnType<typeof pacote["manifest"]>> | null>
    {
        try
        {
            return await pacote.manifest(spec, { registry: this.registry, token: this.token });
        }
        catch (error)
        {
            if (typeGuard<Error & { code?: string }>(error, error instanceof Error && "code" in error) && (error.code == "E404" || error.code == "ETARGET"))
            {
                return null;
            }

            throw error;
        }
    }

    public async hasChanges(leftSpec: string, rightSpec: string, options: HasChangesOptions): Promise<boolean>
    {
        const matcher = options.ignoreFiles ? new PathMatcher(options.ignoreFiles, { unix: true, base: "/package" }) : null;

        const [leftBuffer, rightBuffer] = await Promise.all
        ([
            pack(leftSpec),
            this.getTarball(rightSpec),
        ]);

        if (leftBuffer && rightBuffer)
        {
            const [left, right] = await Promise.all([untar(leftBuffer), untar(rightBuffer)]);

            if (left.size != right.size)
            {
                return true;
            }

            for (const key of left.keys())
            {
                if (!matcher?.isMatch(`/${key}`))
                {
                    if (key == "package/package.json")
                    {
                        const leftPackage  = JSON.parse(left.get(key)!) as PackageJson;
                        const rightPackage = JSON.parse(right.get(key)!) as PackageJson;

                        if (options.ignorePackageVersion)
                        {
                            rightPackage.version = leftPackage.version;
                        }

                        stripFileReferences(leftPackage, rightPackage);

                        if (!deepEqual(leftPackage, rightPackage))
                        {
                            return true;
                        }
                    }
                    else if (stripSourceMap(left.get(key)) != stripSourceMap(right.get(key)))
                    {
                        return true;
                    }
                }
            }

            return false;
        }

        return true;
    }

    public async isPublished(manifest: PackageJson): Promise<boolean>
    {
        return !!await this.get(`${manifest.name}@${manifest.version}`);
    }

    public async publish(manifest: PackageJson, buffer: Buffer, tag: string = "latest"): Promise<void>
    {
        const response = await libnpmpublish.publish(manifest, buffer, { registry: this.registry, forceAuth: { token: this.token }, access: "public", defaultTag: tag });

        if (!response.ok)
        {
            throw new Error(`Failed to publish package ${manifest.name}`);
        }
    }

    public async unpublish(spec: string): Promise<void>
    {
        const response = await libnpmpublish.unpublish(spec, { registry: this.registry, forceAuth: { token: this.token }, access: "public" });

        if (!response)
        {
            throw new Error(`Failed to unpublish package ${spec}`);
        }
    }
}
