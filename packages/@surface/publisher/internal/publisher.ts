import { existsSync }                               from "fs";
import { readFile, writeFile }                      from "fs/promises";
import os                                           from "os";
import { dirname }                                  from "path";
import { Lazy, type RequiredProperties, timestamp } from "@surface/core";
import { enumeratePaths }                           from "@surface/io";
import Logger, { LogLevel }                         from "@surface/logger";
import pack                                         from "libnpmpack";
import type { Manifest }                            from "pacote";
import semver, { type ReleaseType }                 from "semver";
import { isPrerelease }                             from "./common.js";
import Status                                       from "./enums/status.js";
import type { Auth }                                from "./npm-config.js";
import NpmConfig                                    from "./npm-config.js";
import NpmRepository                                from "./npm-repository.js";

type CustomVersion = "custom";
type Package = { manifest: Manifest, path: string };

const GLOB_PRERELEASE = /^\*-(.*)/;

export type Options =
{

    /** Enables canary release */
    canary?:    boolean,

    /** Working dir */
    cwd?: string,

    /** Enables dry run */
    dry?:       boolean,

    logLevel?:  LogLevel,

    /** Packages to bump or publish */
    packages?:  string[],

    /** Npm registry where packages will be published */
    registry?:  string,

    /** Sync file references when bumping */
    syncFileReferences?: boolean,

    /** Timestamp used by canary release */
    timestamp?: string,

    /** Npm token used to publish */
    token?:     string,

};

export default class Publisher
{
    private readonly backup: Map<string, { content: string, path: string }> = new Map();
    private readonly config: Lazy<Promise<NpmConfig | null>> = new Lazy(async () => this.loadConfig());
    private readonly errors: Error[]                                        = [];
    private readonly logger: Logger;
    private readonly lookup: Lazy<Promise<Map<string, Package>>> = new Lazy(async () => this.getLookup());
    private readonly options: RequiredProperties<Options, "cwd" | "packages">;

    public constructor(options: Options)
    {
        this.logger  = new Logger(options.logLevel ?? LogLevel.Info);
        this.options = { cwd: process.cwd(), ...options, packages: this.normalizePatterns(options.packages) };
    }

    private async loadConfig(): Promise<NpmConfig | null>
    {
        return await NpmConfig.load(this.options.cwd, process.env as Record<string, string>)
        ?? await NpmConfig.load(os.homedir(), process.env as Record<string, string>);
    }

    private async getLookup(): Promise<Map<string, Package>>
    {
        const lookup = new Map();

        for await (const filepath of enumeratePaths(this.options.packages, { base: this.options.cwd }))
        {
            if (existsSync(filepath))
            {
                const content = (await readFile(filepath)).toString();
                const manifest = JSON.parse(content) as object as Manifest;

                this.backup.set(manifest.name, { content, path: filepath });
                lookup.set(manifest.name, { manifest, path: filepath });
            }
        }

        return lookup;
    }

    private async getAuth($package: Package): Promise<Auth | undefined>
    {
        const config = await NpmConfig.load(dirname($package.path), process.env as Record<string, string>) ?? await this.config.value;

        let auth: Auth = { };

        if (config)
        {
            auth = { registry: config.registry, token: config.authToken };

            if ($package.manifest.name.startsWith("@"))
            {
                const [scope] = $package.manifest.name.split("/");

                auth = config.getScopedAuth(scope!) ?? auth;
            }
        }

        return {
            registry: this.options.registry ?? auth.registry,
            token:    this.options.token    ?? auth.token,
        };
    }

    private normalizePattern(pattern: string): string
    {
        if (pattern.startsWith("!") || pattern.endsWith("package.json"))
        {
            return pattern;
        }

        return `${pattern.replace(/\/$/, "")}/package.json`;
    }

    private normalizePatterns(packages?: string[]): string[]
    {
        if (packages)
        {
            return packages.map(this.normalizePattern);
        }

        return [];
    }

    private async restorePackages(): Promise<void>
    {
        for (const [key, value] of this.backup)
        {
            await writeFile(value.path, value.content);

            this.logger.trace(`Package ${key} restored!`);
        }
    }

    private async syncPackages(): Promise<void>
    {
        for (const entry of (await this.lookup.value).values())
        {
            await this.syncDependents(entry.manifest, true, undefined, undefined, undefined, undefined);
        }
    }

    // eslint-disable-next-line max-len
    private async syncDependents(manifest: Manifest, updateFileReference: boolean, releaseType: ReleaseType | CustomVersion | undefined, version: string | undefined, identifier: string | undefined, dependencyType?: "dependencies" | "devDependencies" | "peerDependencies"): Promise<void>
    {
        if (dependencyType)
        {
            const lookup = await this.lookup.value;

            for (const { manifest: dependent } of lookup.values())
            {
                const dependencies = dependent[dependencyType];

                const currentVersion  = dependencies?.[manifest.name];

                if (currentVersion && (currentVersion != manifest.version && (updateFileReference || !currentVersion.startsWith("file:"))))
                {
                    dependencies[manifest.name] = `~${manifest.version}`;

                    this.logger.trace(`${manifest.name} in ${dependent.name} ${dependencyType} updated from ${currentVersion} to ${manifest.version}`);
                }
            }
        }
        else
        {
            await this.syncDependents(manifest, updateFileReference, releaseType, version, identifier, "dependencies");
            await this.syncDependents(manifest, updateFileReference, releaseType, version, identifier, "devDependencies");
            await this.syncDependents(manifest, updateFileReference, releaseType, version, identifier, "peerDependencies");
        }
    }

    private async update(manifest: Manifest, releaseType: ReleaseType | CustomVersion, version: string | undefined, identifier: string | undefined): Promise<void>
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
            updated = semver.inc(manifest.version, releaseType, { loose: true, includePrerelease: true }, identifier);
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

        await this.syncDependents(manifest, !!(this.options.syncFileReferences ?? this.options.canary), releaseType, version, identifier);
    }

    /**
     * Bump discovered packages using provided custom version.
     * @param releaseType Type 'custom'
     * @param version Custom version.
     */
    public async bump(releaseType: CustomVersion, version?: string): Promise<void>;

    /**
     * Bump discovered packages using provided release type.
     * @param releaseType Type of release.
     */
    public async bump(releaseType: ReleaseType): Promise<void>;

    /**
     * Bump discovered packages using provided pre-release type.
     * @param releaseType Type of pre-release.
     */
    public async bump(releaseType: Exclude<ReleaseType, "major" | "minor" | "patch">, identifier?: string): Promise<void>;
    public async bump(releaseType: ReleaseType | CustomVersion, identifierOrVersion?: string): Promise<void>;
    public async bump(releaseType: ReleaseType | CustomVersion, identifierOrVersion?: string): Promise<void>
    {
        let version:    string | undefined;
        let identifier: string | undefined;

        if (releaseType == "custom")
        {
            version = identifierOrVersion;
        }
        else if (isPrerelease(releaseType))
        {
            identifier = identifierOrVersion;
        }

        const lookup = await this.lookup.value;

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
                if (!this.options.dry)
                {
                    for (const entry of lookup.values())
                    {
                        await writeFile(entry.path, JSON.stringify(entry.manifest, null, 4));
                    }
                }

                this.logger.info("Bump done!");
            }
            else
            {
                await this.restorePackages();

                throw new AggregateError(this.errors, "Failed to bump some packages.");
            }
        }
    }

    /**
     * Publish discovered packages.
     * @param tag Tag to publish.
     */
    public async publish(tag: string): Promise<void>
    {
        if (this.options.canary)
        {
            await this.bump("custom", `*-dev.${this.options.timestamp ?? timestamp()}`);
        }
        else
        {
            await this.syncPackages();
        }

        try
        {
            for (const $package of (await this.lookup.value).values())
            {
                if (!$package.manifest.private)
                {
                    const auth = await this.getAuth($package);

                    const repository = new NpmRepository(auth);

                    const versionedName = `${$package.manifest.name}@${$package.manifest.version}`;

                    if (await repository.getStatus($package.manifest) == Status.InRegistry)
                    {
                        this.logger.trace(`${versionedName} already in registry, ignoring...`);
                    }
                    else if (!this.options.dry)
                    {
                        const buffer = await pack(dirname($package.path));

                        this.logger.trace(`Publishing ${versionedName}`);

                        await repository.publish($package.manifest, buffer, tag);

                        this.logger.info(`${versionedName} was published`);
                    }
                    else
                    {
                        this.logger.info(`${versionedName} will be published`);
                    }
                }
                else
                {
                    this.logger.trace(`Package ${$package.manifest.name} is private, ignoring...`);
                }
            }
        }
        catch (e)
        {
            this.errors.push(e as Error);
        }
        finally
        {
            if (this.errors.length > 0 || this.options.canary && !this.options.dry)
            {
                await this.restorePackages();
            }
        }

        if (this.errors.length > 0)
        {
            throw new AggregateError(this.errors);
        }
        else
        {
            this.logger.info("Publishing Done!");
        }
    }

    /**
     * Unpublish discovered packages.
     * @param tag Tag to unpublish.
     */
    public async unpublish(tag: string): Promise<void>
    {
        for (const $package of (await this.lookup.value).values())
        {
            if (!$package.manifest.private)
            {
                const auth = await this.getAuth($package);

                const repository = new NpmRepository(auth);

                const versionedName = `${$package.manifest.name}@${$package.manifest.version}`;

                if (await repository.getStatus($package.manifest) != Status.InRegistry)
                {
                    this.logger.trace(`${versionedName} not in registry, ignoring...`);
                }
                else if (!this.options.dry)
                {
                    this.logger.trace(`Unpublishing ${versionedName}`);

                    await repository.unpublish($package.manifest, tag);

                    this.logger.info(`${versionedName} was unpublished`);
                }
                else
                {
                    this.logger.info(`${versionedName} will be unpublished`);
                }
            }
        }

        this.logger.info("Unpublishing Done!");
    }
}
