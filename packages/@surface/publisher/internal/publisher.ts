import { readFile, writeFile }      from "fs/promises";
import path                         from "path";
import { isDirectory }              from "@surface/io";
import Logger, { LogLevel }         from "@surface/logger";
import pacote                       from "pacote";
import type { Manifest }            from "pacote";
import semver, { type ReleaseType } from "semver";

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
            if (semver.gt(manifest.version, latest.version))
            {
                return Status.Updated;
            }

            return Status.InRegistry;
        }

        return Status.New;
    }

    private async update(manifest: Manifest, releaseType: ReleaseType, identifier?: string): Promise<void>
    {
        if (!this.updated.has(manifest.name))
        {
            if (await this.getStatus(manifest) == Status.Updated)
            {
                const actual = manifest.version;

                const updated = semver.inc(manifest.version, releaseType, true, identifier);

                if (!updated)
                {
                    this.looger.error(`Packaged ${manifest.name} has invalid version ${manifest.version}`);
                }
                else
                {
                    manifest.version = updated;

                    this.looger.trace(`${manifest.name} - ${actual} >> ${manifest.version}`);
                }
            }

            this.updated.add(manifest.name);

            await this.updateDependents(manifest, releaseType);
        }
    }

    private async updateDependents(manifest: Manifest, releaseType: ReleaseType, dependencyType?: "dependencies" | "devDependencies" | "peerDependencies"): Promise<void>
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

                await this.update(dependent, releaseType);
            }
        }
        else
        {
            await this.updateDependents(manifest, releaseType, "dependencies");
            await this.updateDependents(manifest, releaseType, "devDependencies");
            await this.updateDependents(manifest, releaseType, "peerDependencies");
        }
    }

    public async bump(releaseType: ReleaseType): Promise<void>
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
                await this.update(entry.manifest, releaseType);
                await writeFile(entry.path, JSON.stringify(entry.manifest, null, 4));
            }

            this.looger.info("Bump done!");
        }
    }
}