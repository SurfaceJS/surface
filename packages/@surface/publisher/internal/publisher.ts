import { existsSync }               from "fs";
import { readFile, writeFile }      from "fs/promises";
import path                         from "path";
import { enumeratePaths }           from "@surface/io";
import Logger, { LogLevel }         from "@surface/logger";
// import pacote                       from "pacote";
import type { Manifest }            from "pacote";
import semver, { type ReleaseType } from "semver";

// enum Status
// // eslint-disable-next-line @typescript-eslint/indent
// {
//     New,
//     Updated,
//     InRegistry
// }

type CustomVersion = "custom";

const GLOB_PRERELEASE = /^\*-(.*)/;

export type Options =
{
    packages?: string[],
    logLevel?: LogLevel,
};

export default class Publisher
{
    private readonly errors: Error[] = [];
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

    // private async get(uri: string): Promise<Manifest | null>
    // {
    //     try
    //     {
    //         return await pacote.manifest(uri, { alwaysAuth: true });
    //     }
    //     catch (error)
    //     {
    //         return null;
    //     }
    // }

    // private async getStatus(manifest: Manifest): Promise<Status>
    // {
    //     const latest = await this.get(`${manifest.name}@latest`);

    //     if (latest)
    //     {
    //         if (semver.gt(manifest.version, latest.version))
    //         {
    //             return Status.Updated;
    //         }

    //         return Status.InRegistry;
    //     }

    //     return Status.New;
    // }

    private async update(manifest: Manifest, releaseType: ReleaseType | CustomVersion, version: string | undefined, identifier: string | undefined): Promise<void>
    {
        if (!this.updated.has(manifest.name))
        {
            const actual = manifest.version;

            let updated: string | null;

            if (releaseType == "custom")
            {
                if (GLOB_PRERELEASE.test(version!))
                {
                    updated = `${manifest.version.split("-")[0]}-${version!.split("-")[1]}`;
                }
                else
                {
                    updated = version!;
                }
            }
            else
            {
                updated = semver.inc(manifest.version, releaseType, { loose: true }, identifier);
            }

            if (!updated)
            {
                const message = `Packaged ${manifest.name} has invalid version ${manifest.version}`;

                this.looger.error(message);

                this.errors.push(new Error(message));
            }
            else
            {
                manifest.version = updated;

                this.looger.trace(`${manifest.name} version updated from ${actual} to ${manifest.version}`);
            }

            this.updated.add(manifest.name);

            await this.updateDependents(manifest, releaseType, version, identifier);
        }
    }

    private async updateDependents(manifest: Manifest, releaseType: ReleaseType | CustomVersion, version: string | undefined, identifier: string | undefined, dependencyType?: "dependencies" | "devDependencies" | "peerDependencies"): Promise<void>
    {
        if (dependencyType)
        {
            const dependentPackages = Array.from(this.lookup.values())
                .map(x => x.manifest)
                .filter(x => !!x[dependencyType]?.[manifest.name] && x[dependencyType]?.[manifest.name] != manifest.version);

            for (const dependent of dependentPackages)
            {
                const dependencyVersion = dependent[dependencyType]![manifest.name];

                dependent[dependencyType]![manifest.name] = `~${manifest.version}`;

                this.looger.trace(`${manifest.name} in ${dependent.name} ${dependencyType} updated from ${dependencyVersion} to ${manifest.version}`);

                await this.update(dependent, releaseType, version, identifier);
            }
        }
        else
        {
            await this.updateDependents(manifest, releaseType, version, identifier, "dependencies");
            await this.updateDependents(manifest, releaseType, version, identifier, "devDependencies");
            await this.updateDependents(manifest, releaseType, version, identifier, "peerDependencies");
        }
    }

    private isPrerelease(releaseType: ReleaseType | "custom"): releaseType is Exclude<ReleaseType, "major" | "minor" | "patch">
    {
        return releaseType.startsWith("pre");
    }

    public async bump(releaseType: CustomVersion, version: string): Promise<void>;
    public async bump(releaseType: ReleaseType): Promise<void>;
    public async bump(releaseType: Exclude<ReleaseType, "major" | "minor" | "patch">, identifier: string): Promise<void>;
    public async bump(releaseType: ReleaseType | CustomVersion, identifierOrVersion?: string): Promise<void>
    {
        let version:    string | undefined;
        let identifier: string | undefined;

        if (releaseType == "custom")
        {
            version = identifierOrVersion;
        }
        else if (this.isPrerelease(releaseType))
        {
            identifier = identifierOrVersion;
        }

        for await (const filepath of enumeratePaths(this.options.packages))
        {
            const filename = filepath.endsWith("package.json") ? filepath : path.join(filepath, "package.json");

            if (existsSync(filename))
            {
                const manifest = JSON.parse((await readFile(filename)).toString()) as object as Manifest;

                this.lookup.set(manifest.name, { manifest, path: filename });
            }
        }

        if (this.lookup.size == 0)
        {
            this.looger.info("No packages found");
        }
        else
        {
            for (const entry of this.lookup.values())
            {
                await this.update(entry.manifest, releaseType, version, identifier);
            }

            if (this.errors.length == 0)
            {
                for (const entry of this.lookup.values())
                {
                    await writeFile(entry.path, JSON.stringify(entry.manifest, null, 4));
                }

                this.looger.info("Bump done!");
            }
            else
            {
                throw new AggregateError(this.errors, "Failed to bump some packages.");
            }
        }
    }
}
