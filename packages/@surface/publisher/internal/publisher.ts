import { existsSync }               from "fs";
import { readFile, writeFile }      from "fs/promises";
import { enumeratePaths }           from "@surface/io";
import Logger, { LogLevel }         from "@surface/logger";
import pack                         from "libnpmpack";
import type { Manifest }            from "pacote";
import semver, { type ReleaseType } from "semver";
import Status                       from "./enums/status.js";
import NpmRepository                from "./npm-repository.js";

type CustomVersion = "custom";

const GLOB_PRERELEASE = /^\*-(.*)/;

export type Options =
{
    dry?:      boolean,
    packages?: string[],
    logLevel?: LogLevel,
    registry?: string,
    token?:    string,
};

export default class Publisher
{
    private readonly backup: Map<string, { content: string, path: string }> = new Map();
    private readonly errors: Error[]                                         = [];
    private readonly logger: Logger;
    private readonly options: Options;
    private readonly published: Set<string> = new Set();
    private readonly repository: NpmRepository;
    private readonly updated = new Set<string>();
    private lookup?: Map<string, { manifest: Manifest, path: string }>;

    public constructor(options: Options)
    {
        this.repository = new NpmRepository(options.registry, options.token);
        this.logger     = new Logger(options.logLevel ?? LogLevel.Info);

        this.options = { ...options, packages: this.normalizePatterns(options.packages) };
    }

    private async getLookup(): Promise<Map<string, { manifest: Manifest, path: string }>>
    {
        if (!this.lookup)
        {
            this.lookup = new Map();

            for await (const filepath of enumeratePaths(this.options.packages ?? []))
            {
                if (existsSync(filepath))
                {
                    const content = (await readFile(filepath)).toString();
                    const manifest = JSON.parse(content) as object as Manifest;

                    this.backup.set(manifest.name, { content, path: filepath });
                    this.lookup.set(manifest.name, { manifest, path: filepath });
                }
            }
        }

        return this.lookup;
    }

    private normalizePattern(pattern: string): string
    {
        if (pattern.endsWith("package.json"))
        {
            return pattern;
        }

        return `${pattern.replace(/\/$/, "")}/package.json`;
    }

    private normalizePatterns(packages?: string[]): string[] | undefined
    {
        if (packages)
        {
            return packages.map(this.normalizePattern);
        }

        return undefined;
    }

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

                this.logger.error(message);

                this.errors.push(new Error(message));
            }
            else
            {
                manifest.version = updated;

                this.logger.trace(`${manifest.name} version updated from ${actual} to ${manifest.version}`);
            }

            this.updated.add(manifest.name);

            await this.updateDependents(manifest, releaseType, version, identifier);
        }
    }

    private async updateDependents(manifest: Manifest, releaseType: ReleaseType | CustomVersion, version: string | undefined, identifier: string | undefined, dependencyType?: "dependencies" | "devDependencies" | "peerDependencies"): Promise<void>
    {
        const lookup = await this.getLookup();

        if (dependencyType)
        {
            const dependentPackages = Array.from(lookup.values())
                .map(x => x.manifest)
                .filter(x => !!x[dependencyType]?.[manifest.name] && x[dependencyType]?.[manifest.name] != manifest.version);

            for (const dependent of dependentPackages)
            {
                const dependencyVersion = dependent[dependencyType]![manifest.name];

                dependent[dependencyType]![manifest.name] = `~${manifest.version}`;

                this.logger.trace(`${manifest.name} in ${dependent.name} ${dependencyType} updated from ${dependencyVersion} to ${manifest.version}`);

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

    /**
     * Bump discoreved packages using provided custom version.
     * @param releaseType Type 'custom'
     * @param version Custom version.
     */
    public async bump(releaseType: CustomVersion, version: string): Promise<void>;

    /**
     * Bump discoreved packages using provided release type.
     * @param releaseType Type of release.
     */
    public async bump(releaseType: ReleaseType): Promise<void>;

    /**
     * Bump discoreved packages using provided pre-release type.
     * @param releaseType Type of pre-release.
     */
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

        const lookup = await this.getLookup();

        if (lookup.size == 0)
        {
            this.logger.info("No packages found");
        }
        else
        {
            for (const entry of lookup.values())
            {
                await this.update(entry.manifest, releaseType, version, identifier);
            }

            if (this.errors.length == 0)
            {
                for (const entry of lookup.values())
                {
                    await writeFile(entry.path, JSON.stringify(entry.manifest, null, 4));
                }

                this.logger.info("Bump done!");
            }
            else
            {
                throw new AggregateError(this.errors, "Failed to bump some packages.");
            }
        }
    }

    /**
     * Publish discovered packages.
     * @param filter Optional filter.
     */
    public async publish(filter?: string[]): Promise<void>
    {
        const lookup = await this.getLookup();

        const packages = filter ? filter.map(x => lookup.get(x)!) : lookup.values();

        for (const $package of packages)
        {
            if (this.published.has($package.manifest.name) || await this.repository.getStatus($package.manifest) == Status.InRegistry)
            {
                this.logger.info(`${$package.manifest.name} is updated`);

                this.published.add($package.manifest.name);
            }
            else if (!this.published.has($package.manifest.name))
            {
                if ($package.manifest.dependencies)
                {
                    const dependencies = Object.keys($package.manifest.dependencies)
                        .filter(x => lookup.has(x));

                    if (dependencies.length > 0)
                    {
                        await this.publish(dependencies);
                    }
                }

                const buffer = await pack($package.path);

                this.logger.info(`Publishing ${$package.manifest.name}`);

                if (!this.options.dry)
                {
                    const tag = semver.prerelease($package.manifest.version)
                        ? "next"
                        : "latest";

                    await this.repository.publish($package.manifest, buffer, tag);
                }

                this.published.add($package.manifest.name);
            }
        }
    }

    /** Undo bumped packages. */
    public async undo(): Promise<void>
    {
        for (const entry of this.backup.values())
        {
            await writeFile(entry.path, entry.content);
        }
    }
}
