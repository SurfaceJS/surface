import { readFile, writeFile }                                     from "fs/promises";
import os                                                          from "os";
import { dirname }                                                 from "path";
import type { PackageJson as _PackageJson }                        from "@npm/types";
import { type RequiredProperties, timestamp }                      from "@surface/core";
import Logger, { LogLevel }                                        from "@surface/logger";
import { enumeratePaths, execute }                                 from "@surface/rwx";
import pack                                                        from "libnpmpack";
import semver, { type ReleaseType }                                from "semver";
import { isGlobPrerelease, isSemanticVersion, overridePrerelease } from "./common.js";
import Status                                                      from "./enums/status.js";
import type { Auth }                                               from "./npm-config.js";
import NpmConfig                                                   from "./npm-config.js";
import NpmRepository                                               from "./npm-repository.js";
import type { GlobPrerelease, SemanticVersion }                    from "./types/version.js";

/* cSpell:ignore preid, premajor, preminor, prepatch, postpack, postpublish */

type PackageJson = _PackageJson & { workspaces?: string[] };

type Metadata =
{
    manifest:    PackageJson,
    path:        string,
    config:      NpmConfig | null,
    workspaces?: Map<string, Metadata>,
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

export type Options =
{

    /** Working dir */
    cwd?: string,

    /** Enables dry run */
    dry?: boolean,

    /** Include private packages when bumping or publishing. */
    includePrivate?: boolean,

    /** Include workspace root when bumping or publishing. */
    includeWorkspaceRoot?: boolean,

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

export type BumpOptions =
{

    /** Ignore workspace version and bump itself. */
    independent?: boolean,

    /** Synchronize bumped versions of the dependents package in the workspace. */
    synchronize?: boolean,

    /** Update file references when bumping. */
    updateFileReferences?: boolean,
};

export type Version = SemanticVersion | GlobPrerelease | ReleaseType;

export default class Publisher
{
    private readonly backup:  Map<string, string> = new Map();
    private readonly errors:  Error[]             = [];
    private readonly logger:  Logger;
    private readonly options: RequiredProperties<Options, "cwd" | "packages">;

    private config:     NpmConfig | null      = null;
    private loaded:     boolean               = false;
    private workspaces: Map<string, Metadata> = new Map();

    public constructor(options: Options)
    {
        this.logger  = new Logger(options.logLevel ?? LogLevel.Info);
        this.options =
        {
            cwd:      process.cwd(),
            packages: ["package.json"],
            ...options,
        };
    }

    private async loadConfig(): Promise<void>
    {
        this.config = await NpmConfig.load(os.homedir(), process.env as Record<string, string>);
    }

    private async loadMetadata(): Promise<boolean>;
    private async loadMetadata(packages: string[], cwd: string, level?: number): Promise<Map<string, Metadata>>;
    private async loadMetadata(packages?: string[], cwd?: string, level: number = 1): Promise<boolean | Map<string, Metadata>>
    {
        if (packages && cwd)
        {
            const workspaces = new Map<string, Metadata>();

            for await (const path of enumeratePaths(packages, { base: cwd }))
            {
                const content  = (await readFile(path)).toString();
                const manifest = JSON.parse(content) as object as PackageJson;

                this.backup.set(path, content);

                let packageWorkspaces: Map<string, Metadata> | undefined;

                const parentPath = dirname(path);

                if (Array.isArray(manifest.workspaces))
                {
                    packageWorkspaces = level < 2
                        ? await this.loadMetadata(manifest.workspaces.map(this.normalizePattern), parentPath, level + 1)
                        : new Map();
                }

                const metadata: Metadata =
                {
                    config:     await NpmConfig.load(parentPath, process.env),
                    manifest,
                    path,
                    workspaces: packageWorkspaces,
                };

                workspaces.set(manifest.name, metadata);
            }

            return workspaces;
        }

        if (!this.loaded)
        {
            this.workspaces = await this.loadMetadata(this.options.packages.map(this.normalizePattern), this.options.cwd);

            if (this.workspaces.size == 0)
            {
                this.logger.warn("No packages found.");
            }

            this.loaded = true;
        }

        return this.workspaces.size > 0;
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

            await execute(`npm run ${script} --if-present --color`, { cwd });
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

    private async publishWorkspaces(tag: string, workspaces: Map<string, Metadata>, config: NpmConfig | null): Promise<void>
    {
        for (const metadata of workspaces.values())
        {
            const parentPath = dirname(metadata.path);

            if (metadata.workspaces?.size)
            {
                await this.runScript("prepublishworkspace", parentPath);

                await this.publishWorkspaces(tag, metadata.workspaces, metadata.config ?? config);
            }

            if ((this.options.includePrivate || !metadata.manifest.private) && (this.options.includeWorkspaceRoot || !metadata.workspaces))
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

            if (metadata.workspaces?.size)
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

    private sync(manifest: PackageJson, workspaces: Map<string, Metadata>, options: BumpOptions, dependencyType?: "dependencies" | "devDependencies" | "peerDependencies"): void
    {
        if (dependencyType)
        {
            const dependencies = manifest[dependencyType];

            if (dependencies)
            {
                for (const [name, version] of Object.entries(dependencies))
                {
                    if (options.updateFileReferences || !version.startsWith("file:"))
                    {
                        const dependency = workspaces.get(name)?.manifest;

                        if (dependency)
                        {
                            dependencies[name] = `~${dependency.version}`;

                            this.logger.trace(`${dependencyType}:${name} in ${manifest.name} updated from ${version} to ${dependency.version}`);
                        }
                    }
                }
            }
        }
        else
        {
            this.sync(manifest, workspaces, options, "dependencies");
            this.sync(manifest, workspaces, options, "devDependencies");
            this.sync(manifest, workspaces, options, "peerDependencies");
        }
    }

    private async writeWorkspaces(options: BumpOptions, workspaces: Map<string, Metadata> = this.workspaces): Promise<void>
    {
        for (const entry of workspaces.values())
        {
            if (this.options.includeWorkspaceRoot || !entry.workspaces)
            {
                if (options.synchronize)
                {
                    this.sync(entry.manifest, workspaces, options);
                }

                if (!this.options.dry)
                {
                    await writeFile(entry.path, JSON.stringify(entry.manifest, null, 4));
                }
                else
                {
                    this.logger.info(`Version ${entry.manifest.name}@${entry.manifest.version} will be written in ${entry.path}...`);
                }
            }

            if (entry.workspaces)
            {
                await this.writeWorkspaces(options, entry.workspaces);
            }
        }
    }

    private async update(workspaces: Map<string, Metadata>, version: Version, identifier: string | undefined, options: BumpOptions = { }): Promise<void>
    {
        for (const metadata of workspaces.values())
        {
            const manifest = metadata.manifest;
            const actual   = manifest.version;

            if (this.options.includePrivate || !manifest.private)
            {
                const updated: string | null = isSemanticVersion(version)
                    ? version
                    : isGlobPrerelease(version)
                        ? overridePrerelease(manifest.version, version)
                        : semver.inc(manifest.version, version, { loose: true }, identifier);

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
            }
            else
            {
                this.logger.trace(`Package ${metadata.manifest.name} is private, bump ignored...`);
            }

            if (metadata.workspaces?.size)
            {
                await this.update(metadata.workspaces, options.independent ? version : metadata.manifest.version as SemanticVersion, identifier, options);
            }
        }
    }

    private async unpublishWorkspaces(tag: string, workspaces: Map<string, Metadata>, config: NpmConfig | null): Promise<void>
    {
        for (const metadata of workspaces.values())
        {
            if ((this.options.includePrivate || !metadata.manifest.private) && (this.options.includeWorkspaceRoot || !metadata.workspaces))
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

            if (metadata.workspaces?.size)
            {
                await this.unpublishWorkspaces(tag, metadata.workspaces, metadata.config ?? config);
            }
        }
    }

    /**
     * Bump discovered packages using provided custom version.
     * @param version An semantic version or an release type: major, minor, patch, premajor, preminor, prepatch, prerelease.
     * Also can accept an glob prerelease '*-dev+123' to override just the prerelease part of the version. Useful for canary builds.
     * @param identifier The "prerelease identifier" to use as a prefix for the "prerelease" part of a semver. Like the rc in 1.2.0-rc.8.
     */
    public async bump(version: Version, identifier?: string, options: BumpOptions = { }): Promise<void>
    {
        if (await this.loadMetadata())
        {
            await this.update(this.workspaces, version, identifier, options);

            if (options.synchronize)
            {
                await this.writeWorkspaces(options);
            }

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
    public async publish(tag: string): Promise<void>;

    /**
     * Publish discovered packages.
     * @param tag Tag to publish.
     * @param canary Enables canary release.
     * @param releaseType Identifier used to generate canary prerelease.
     * @param identifier The "prerelease identifier" to use as a prefix for the "prerelease" part of a semver. Like the rc in 1.2.0-rc.8.
     * @param sequence Sequence used to compose the prerelease.
     */

    public async publish(tag: string, canary?: boolean, releaseType?: ReleaseType, identifier?: string, sequence?: string): Promise<void>;
    public async publish(tag: string, canary?: boolean, releaseType?: ReleaseType, identifier?: string, sequence?: string): Promise<void>
    {
        await this.loadConfig();

        if (await this.loadMetadata())
        {
            if (canary)
            {
                const options: BumpOptions = { synchronize: true };

                releaseType
                    ? await this.bump(releaseType, identifier + (sequence ? `.${sequence}` : ""), options)
                    : await this.bump(`*-${identifier ?? "dev"}.${sequence ?? timestamp()}`, undefined, options);
            }
            else
            {
                await this.writeWorkspaces({ updateFileReferences: true });
            }

            await this.publishWorkspaces(tag, this.workspaces, this.config);

            if (this.errors.length > 0 || canary && !this.options.dry)
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
