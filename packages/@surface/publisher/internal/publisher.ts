import { readFile, writeFile } from "fs/promises";
import path                    from "path";
import { Version }             from "@surface/core";
import { isDirectory }         from "@surface/io";
import Logger, { LogLevel }    from "@surface/logger";
import pacote                  from "pacote";
import type { Manifest }       from "pacote";
import BumpType                from "./enums/bump-types.js";

enum Status
// eslint-disable-next-line @typescript-eslint/indent
{
    New,
    Updated,
    InRegistry
}

export type Options =
{
    packages?: string[],
    logLevel?: LogLevel,
};

export default class Publisher
{
    private readonly looger: Logger;
    private readonly lookup  = new Map<string, { manifest: Manifest, path: string }>();
    private readonly updated = new Set<string>();
    private readonly options: Required<Options>;
    public constructor(options: Options)
    {
        this.options =
        {
            logLevel: options.logLevel ?? LogLevel.Info,
            packages: options.packages ?? [],
        };

        this.looger = new Logger(this.options.logLevel);
    }

    private async get(uri: string): Promise<Manifest | null>
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

    private async getStatus(manifest: Manifest): Promise<Status>
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

    private async update(manifest: Manifest, type: BumpType, customVersion?: string): Promise<void>;
    private async update(manifest: Manifest, type: BumpType, customVersion?: string): Promise<void>
    {
        if (!this.updated.has(manifest.name))
        {
            if (await this.getStatus(manifest) == Status.Updated)
            {
                const actual = manifest.version;

                if (customVersion && type == BumpType.Custom)
                {
                    manifest.version = Version.parse(customVersion).toString();
                }
                else
                {
                    const version = Version.parse(manifest.version);

                    if (type == BumpType.Major)
                    {
                        version.major++;
                        version.minor = 0;
                        version.patch = 0;
                    }
                    else if (type == BumpType.Minor)
                    {
                        version.minor++;
                        version.patch = 0;
                    }
                    else if (type == BumpType.Patch)
                    {
                        version.patch++;
                    }

                    manifest.version = version.toString();
                }

                this.looger.trace(`${manifest.name} - ${actual} >> ${manifest.version}`);
            }

            this.updated.add(manifest.name);

            await this.updateDependents(manifest, type);
        }
    }

    private async updateDependents(manifest: Manifest, type: BumpType, dependencyType?: "dependencies" | "devDependencies" | "peerDependencies"): Promise<void>
    {
        if (dependencyType)
        {
            const dependentPackages = Array.from(this.lookup.values())
                .map(x => x.manifest)
                .filter(x => !!x[dependencyType]?.[manifest.name] && x[dependencyType]?.[manifest.name] != manifest.version);

            for (const dependent of dependentPackages)
            {
                const version = dependent[dependencyType]![manifest.name];

                dependent[dependencyType]![manifest.name] = `~${manifest.version}`;

                this.looger.info(`${manifest.name} ${dependencyType} in ${dependent.name} - ${version} >> ${manifest.version}`);

                await this.update(dependent, type);
            }
        }
        else
        {
            await this.updateDependents(manifest, type, "dependencies");
            await this.updateDependents(manifest, type, "devDependencies");
            await this.updateDependents(manifest, type, "peerDependencies");
        }
    }

    public async bump(type: BumpType): Promise<void>
    {
        for (const filepath of this.options.packages)
        {
            const filename = await isDirectory(filepath) ? path.join(filepath, "package.json") : filepath;
            const manifest = JSON.parse((await readFile(filename)).toString()) as object as Manifest;

            this.lookup.set(manifest.name, { manifest, path: filename });
        }

        if (this.lookup.size == 0)
        {
            this.looger.info("");
        }
        else
        {
            for (const entry of this.lookup.values())
            {
                await this.update(entry.manifest, type);
                await writeFile(entry.path, JSON.stringify(entry.manifest, null, 4));
            }

            this.looger.info("Bump done!");
        }
    }
}