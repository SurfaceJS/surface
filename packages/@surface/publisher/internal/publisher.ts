import { readFile, writeFile }                from "fs/promises";
import os                                     from "os";
import { dirname }                            from "path";
import { type RequiredProperties, timestamp } from "@surface/core";
import { enumeratePaths }                     from "@surface/io";
import Logger, { LogLevel }                   from "@surface/logger";
import pack                                   from "libnpmpack";
import type { Manifest }                      from "pacote";
import semver, { type ReleaseType }           from "semver";
import { execute, isPrerelease }              from "./common.js";
import Status                                 from "./enums/status.js";
import type { Auth }                          from "./npm-config.js";
import NpmConfig                              from "./npm-config.js";
import NpmRepository                          from "./npm-repository.js";

/* cSpell:ignore postpack, postpublish */

type CustomVersion = "custom";
type Metadata =
{
    manifest:   Manifest,
    path:       string,
    config:     NpmConfig | null,
    workspaces?: Metadata[],
};

type ScriptType =
    | "prepublishworkspace"
    | "prepublish"
    | "prepublishOnly"
    | "prepack"
    | "prepare"
    | "postpack"
    | "publish"
    | "postpublish"
    | "postpublishworkspace";

const GLOB_PRERELEASE = /^\*-(.*)/;

export type Options =
{

    /** Enables canary release */
    canary?: boolean,

    /** Working dir */
    cwd?: string,

    /** Enables dry run */
    dry?: boolean,

    /** Include private packages when bumping or publishing. */
    includePrivates?: boolean,

    /** Include workspaces root when bumping or publishing. */
    includeWorkspacesRoot?: boolean,

    /** Ignore workspace version and bump itself. */
    independentVersion?: boolean,

    logLevel?: LogLevel,

    /** Packages to bump or publish */
    packages?: string[],

    /** Npm registry where packages will be published */
    registry?: string,

    /** Update file references when bumping */
    updateFileReferences?: boolean,

    /** Timestamp used by canary release */
    timestamp?: string,

    /** Npm token used to publish */
    token?: string,
};

export default class Publisher
{
    private readonly backup: Map<string, string> = new Map();
    private readonly errors: Error[]                                        = [];
    private readonly logger: Logger;
    private readonly options: RequiredProperties<Options, "cwd" | "packages">;

    private config:    NpmConfig | null = null;
    private loaded:    boolean = false;
    private workspaces: Metadata[] = [];

    public constructor(options: Options)
    {
        this.logger  = new Logger(options.logLevel ?? LogLevel.Info);
        this.options =
        {
            cwd:      process.cwd(),
            ...options,
            packages: options.packages ?? ["package.json"],
        };
    }

    private async loadConfig(): Promise<void>
    {
        this.config = await NpmConfig.load(os.homedir(), process.env as Record<string, string>);
    }

    private async loadMetadata(): Promise<boolean>;
    private async loadMetadata(packages: string[], cwd: string, level?: number): Promise<Metadata[]>;
    private async loadMetadata(packages?: string[], cwd?: string, level: number = 1): Promise<boolean | Metadata[]>
    {
        if (packages && cwd)
        {
            const workspaces: Metadata[] = [];

            for await (const path of enumeratePaths(packages, { base: cwd }))
            {
                const content  = (await readFile(path)).toString();
                const manifest = JSON.parse(content) as object as Manifest;

                this.backup.set(path, content);

                let packageWorkspaces: Metadata[] | undefined;

                const parentPath = dirname(path);

                if (Array.isArray(manifest.workspaces))
                {
                    packageWorkspaces = level < 2
                        ? await this.loadMetadata(manifest.workspaces.map(this.normalizePattern), parentPath, level + 1)
                        : [];
                }

                const metadata: Metadata =
                {
                    config:     await NpmConfig.load(parentPath, process.env),
                    manifest,
                    path,
                    workspaces: packageWorkspaces,
                };

                workspaces.push(metadata);
            }

            return workspaces;
        }

        if (!this.loaded)
        {
            this.workspaces = await this.loadMetadata(this.options.packages.map(this.normalizePattern), this.options.cwd);

            if (this.workspaces.length == 0)
            {
                this.logger.warn("No packages found.");
            }

            this.loaded = true;
        }

        return this.workspaces.length > 0;
    }

    private getAuth(metadata: Metadata, fallback: NpmConfig | null): Auth
    {
        const config = metadata.config ?? fallback;

        let auth: Auth = { };

        if (config)
        {
            auth = { registry: config.registry, token: config.authToken };

            if (metadata.manifest.name.startsWith("@"))
            {
                const [scope] = metadata.manifest.name.split("/");

                auth = config.getScopedAuth(scope!) ?? auth;
            }
        }

        return {
            registry: this.options.registry ?? auth.registry,
            token:    this.options.token    ?? auth.token,
        };
    }

    private async runScript(script: ScriptType, cwd: string): Promise<void>
    {
        if (!this.options.dry)
        {
            this.logger.trace(`Running ${script} script in ${cwd}...`);

            await execute(`npm run ${script} --if-present --color`, cwd);
        }
        else
        {
            this.logger.trace(`Will run ${script} script in ${cwd}...`);
        }
    }

    private normalizePattern(pattern: string): string
    {
        if (pattern.startsWith("!") || pattern.endsWith("package.json"))
        {
            return pattern;
        }

        return `${pattern.replace(/\/$/, "")}/package.json`;
    }

    private async publishWorkspaces(tag: string, workspaces: Metadata[], config: NpmConfig | null): Promise<void>
    {
        for (const metadata of workspaces)
        {
            const parentPath = dirname(metadata.path);

            if (metadata.workspaces?.length)
            {
                await this.runScript("prepublishworkspace", parentPath);

                await this.publishWorkspaces(tag, metadata.workspaces, metadata.config ?? config);
            }

            if ((this.options.includePrivates || !metadata.manifest.private) && (this.options.includeWorkspacesRoot || !metadata.workspaces))
            {
                const auth = this.getAuth(metadata, config);

                const repository = new NpmRepository(auth);

                const versionedName = `${metadata.manifest.name}@${metadata.manifest.version}`;

                if (await repository.getStatus(metadata.manifest) == Status.InRegistry)
                {
                    this.logger.trace(`${versionedName} already in registry, ignoring...`);
                }
                else if (!this.options.dry)
                {
                    try
                    {
                        await this.runScript("prepublish", parentPath);
                        await this.runScript("prepublishOnly", parentPath);
                        await this.runScript("prepack", parentPath);
                        await this.runScript("prepare", parentPath);

                        const buffer = await pack(parentPath);

                        await this.runScript("postpack", parentPath);

                        this.logger.trace(`Publishing ${versionedName}`);

                        await repository.publish(metadata.manifest, buffer, tag);

                        await this.runScript("postpublish", parentPath);

                        this.logger.info(`${versionedName} was published.`);
                    }
                    catch (error)
                    {
                        this.logger.error(`Failed to publish package ${versionedName}.`);

                        this.errors.push(error as Error);
                    }
                }
                else
                {
                    this.logger.info(`${versionedName} will be published.`);
                }
            }
            else
            {
                this.logger.trace(`Package ${metadata.manifest.name} is ${metadata.manifest.private ? "private" : "an workspace"}, publishing ignored...`);
            }

            if (metadata.workspaces?.length)
            {
                await this.runScript("postpublishworkspace", parentPath);
            }
        }
    }

    private async restorePackages(): Promise<void>
    {
        for (const [key, value] of this.backup)
        {
            await writeFile(key, value);

            this.logger.trace(`Package ${key} restored!`);
        }
    }

    private sync(manifest: Manifest, workspaces: Metadata[], syncFileReferences: boolean, dependencyType?: "dependencies" | "devDependencies" | "peerDependencies"): void
    {
        if (dependencyType)
        {
            for (const { manifest: dependent } of workspaces)
            {
                const dependencies = dependent[dependencyType];

                const currentVersion  = dependencies?.[manifest.name];

                if (currentVersion && (currentVersion != manifest.version && (syncFileReferences || !currentVersion.startsWith("file:"))))
                {
                    dependencies[manifest.name] = `~${manifest.version}`;

                    this.logger.trace(`${manifest.name} in ${dependent.name} ${dependencyType} updated from ${currentVersion} to ${manifest.version}`);
                }
            }
        }
        else
        {
            this.sync(manifest, workspaces, syncFileReferences, "dependencies");
            this.sync(manifest, workspaces, syncFileReferences, "devDependencies");
            this.sync(manifest, workspaces, syncFileReferences, "peerDependencies");
        }
    }

    private syncWorkspaces(workspaces: Metadata[] = this.workspaces): void
    {
        for (const entry of workspaces.values())
        {
            if (this.options.includeWorkspacesRoot || !entry.workspaces)
            {
                this.sync(entry.manifest, workspaces, true);
            }

            if (entry.workspaces)
            {
                this.syncWorkspaces(entry.workspaces);
            }
        }
    }

    private async update(workspaces: Metadata[], releaseType: ReleaseType | CustomVersion, version: string | undefined, identifier: string | undefined): Promise<void>
    {
        for (const metadata of workspaces)
        {
            const manifest = metadata.manifest;
            const actual   = manifest.version;

            if (this.options.includePrivates || !manifest.private)
            {
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

                    if (!this.options.dry)
                    {
                        await writeFile(metadata.path, JSON.stringify(metadata.manifest, null, 4));
                    }
                    else
                    {
                        this.logger.info(`Version ${metadata.manifest.name}@${metadata.manifest.version} will be written in ${metadata.path}...`);
                    }
                }
            }
            else
            {
                this.logger.trace(`Package ${metadata.manifest.name} is private, bump ignored...`);
            }

            if (workspaces != this.workspaces && (this.options.includeWorkspacesRoot || !metadata.workspaces))
            {
                this.sync(metadata.manifest, workspaces, !!(this.options.updateFileReferences ?? this.options.canary));
            }

            if (metadata.workspaces?.length)
            {
                const [$releaseType, $version] = this.options.independentVersion
                    ? [releaseType, version]
                    : ["custom" as const, metadata.manifest.version];

                await this.update(metadata.workspaces, $releaseType, $version, identifier);
            }
        }
    }

    private async unpublishWorkspaces(tag: string, workspaces: Metadata[], config: NpmConfig | null): Promise<void>
    {
        for (const metadata of workspaces.values())
        {
            if ((this.options.includePrivates || !metadata.manifest.private) && (this.options.includeWorkspacesRoot || !metadata.workspaces))
            {
                const auth = this.getAuth(metadata, config);

                const repository = new NpmRepository(auth);

                const versionedName = `${metadata.manifest.name}@${metadata.manifest.version}`;

                if (await repository.getStatus(metadata.manifest) != Status.InRegistry)
                {
                    this.logger.trace(`${versionedName} not in registry, ignoring...`);
                }
                else if (!this.options.dry)
                {
                    try
                    {
                        this.logger.trace(`Unpublishing ${versionedName}.`);

                        await repository.unpublish(metadata.manifest, tag);

                        this.logger.info(`${versionedName} was unpublished.`);
                    }
                    catch (error)
                    {
                        this.logger.error(`Failed to unpublish package ${versionedName}!`);

                        this.errors.push(error as Error);
                    }
                }
                else
                {
                    this.logger.info(`${versionedName} will be unpublished.`);
                }
            }
            else
            {
                this.logger.trace(`Package ${metadata.manifest.name} is ${metadata.manifest.private ? "private" : "an workspace"}, unpublishing ignored...`);
            }

            if (metadata.workspaces?.length)
            {
                await this.unpublishWorkspaces(tag, metadata.workspaces, metadata.config ?? config);
            }
        }
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

        if (await this.loadMetadata())
        {
            await this.update(this.workspaces, releaseType, version, identifier);

            if (this.errors.length > 0)
            {
                await this.restorePackages();

                this.logger.warn("Failed to bump some packages.");

                throw new AggregateError(this.errors);
            }
            else
            {
                this.logger.info("Bump done!");
            }
        }
    }

    /**
     * Publish discovered packages.
     * @param tag Tag to publish.
     */
    public async publish(tag: string): Promise<void>
    {
        await this.loadConfig();

        if (await this.loadMetadata())
        {
            if (this.options.canary)
            {
                await this.bump("custom", `*-dev.${this.options.timestamp ?? timestamp()}`);
            }
            else
            {
                this.syncWorkspaces();
            }

            await this.publishWorkspaces(tag, this.workspaces, this.config);

            if (this.errors.length > 0 || this.options.canary && !this.options.dry)
            {
                await this.restorePackages();
            }

            if (this.errors.length > 0)
            {
                this.logger.warn("Publishing done with errors!");

                throw new AggregateError(this.errors);
            }
            else
            {
                this.logger.info("Publishing Done!");
            }
        }
    }

    /**
     * Unpublish discovered packages.
     * @param tag Tag to unpublish.
     */
    public async unpublish(tag: string): Promise<void>
    {
        await this.loadConfig();

        if (await this.loadMetadata())
        {
            await this.unpublishWorkspaces(tag, this.workspaces, this.config);

            if (this.errors.length > 0)
            {
                this.logger.warn("Unpublishing done with errors!");

                throw new AggregateError(this.errors);
            }
            else
            {
                this.logger.info("Unpublishing Done!");
            }
        }
    }
}
