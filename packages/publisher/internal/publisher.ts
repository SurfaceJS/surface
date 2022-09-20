import { readFile, writeFile }                                                from "fs/promises";
import os                                                                     from "os";
import { dirname, join, resolve }                                             from "path";
import type { PackageJson as _PackageJson }                                   from "@npm/types";
import { type RequiredProperties }                                            from "@surface/core";
import Logger, { LogLevel }                                                   from "@surface/logger";
import { enumeratePaths, execute }                                            from "@surface/rwx";
import pack                                                                   from "libnpmpack";
import semver, { type ReleaseType }                                           from "semver";
import { isGlobPrerelease, isSemanticVersion, overridePrerelease, timestamp } from "./common.js";
import type { Auth }                                                          from "./npm-config.js";
import NpmConfig                                                              from "./npm-config.js";
import NpmService                                                             from "./npm-service.js";
import type { GlobPrerelease, SemanticVersion }                               from "./types/version.js";

/* cSpell:ignore preid, premajor, preminor, prepatch, postpack, postpublish */

type Pre<T extends string> = T extends `pre${string}` ? T : never;

type PackageJson = _PackageJson & { workspaces?: string[] };

type Entry =
{
    auth:        Auth,
    manifest:    PackageJson,
    modified:    boolean,
    path:        string,
    remote:      Pick<PackageJson, "name" | "version"> | null,
    service:     NpmService,
    workspaces?: Map<string, Entry>,
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

type LoadOptions =
{
    tag?:           string,
    cwd?:           string,
    packages?:      string[],
    auth?:          Auth,
    ignoreChanges?: string[],
};

type RestrictionOptions =
{

    /** Includes private packages. */
    includePrivate?: boolean,

    /** Includes workspace root. */
    includeWorkspaceRoot?: boolean,
};

export type Options =
{

    /** Working dir */
    cwd?: string,

    /** Enables dry run */
    dry?: boolean,

    logLevel?: LogLevel,

    /** Packages to bump or publish */
    packages?: string[],

    /** Target registry. When provided this override the value found in npmrc files */
    registry?: string,

    /** Registry token. When provided this override the value found in npmrc files */
    token?: string,
};

export type BumpOptions =
{

    /** Dist tag used to compare local and remote packages. Default: latest */
    tag?: string,

    /** Ignore workspace root version and bump itself. */
    independent?: boolean,

    /** Forces to bump unchanged packages when independent options is enabled */
    force?: boolean,

    /** Update file references when bumping. */
    updateFileReferences?: boolean,

    /** Synchronize dependencies between workspace packages after bumping. */
    synchronize?: boolean,
} & Pick<ChangedOptions, "ignoreChanges">;

export type ChangedOptions =
{

    /** Files to ignore when detecting changes. */
    ignoreChanges?: string[],
} & RestrictionOptions;

export type PublishOptions =
{

    /** Semantic version build. Used by canary.*/
    build?: string,

    /** Enables canary release. */
    canary?: boolean,

    /** Forces to publish unchanged packages. Used by canary.*/
    force?: boolean,

    /** The "prerelease identifier" to use as a prefix for the "prerelease" part of a semver. Used by canary. */
    preid?: string,

    /** An prerelease type. Used by canary. */
    prereleaseType?: Pre<ReleaseType>,

    /** Synchronize dependencies between workspace packages before publishing. */
    synchronize?: boolean,
} & ChangedOptions & RestrictionOptions;

export type UnpublishOptions = RestrictionOptions;

export type Version = SemanticVersion | GlobPrerelease | ReleaseType;

export default class Publisher
{
    private readonly backup:  Map<string, string> = new Map();
    private readonly errors:  Error[]             = [];
    private readonly logger:  Logger;
    private readonly options: RequiredProperties<Options, "cwd" | "packages">;

    private loaded:     boolean               = false;
    private workspaces: Map<string, Entry> = new Map();

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

    private changedWorkspaces(workspaces: Map<string, Entry>, options: ChangedOptions): string[]
    {
        const changes: string[] = [];

        for (const entry of workspaces.values())
        {
            if (entry.modified && (options.includePrivate || !entry.manifest.private) && (options.includeWorkspaceRoot || !entry.workspaces))
            {
                changes.push(entry.manifest.name);
            }

            if (entry.workspaces)
            {
                changes.push(...this.changedWorkspaces(entry.workspaces, options));
            }
        }

        return changes;
    }

    private async loadWorkspaces(options?: Pick<LoadOptions, "tag" | "ignoreChanges">): Promise<boolean>;
    private async loadWorkspaces(options: LoadOptions, depth: number): Promise<Map<string, Entry>>;
    private async loadWorkspaces(options: LoadOptions = { }, depth: number = 0): Promise<boolean | Map<string, Entry>>
    {
        if (options.packages && options.cwd)
        {
            const promises: Promise<[string, Entry]>[] = [];

            for await (const path of enumeratePaths(options.packages, { base: options.cwd }))
            {
                promises.push(this.loadEntry(path, options, depth));
            }

            return new Map<string, Entry>(await Promise.all(promises));
        }

        if (!this.loaded)
        {
            this.logger.trace("Loading workspaces...");

            const auth = await this.getAuth(os.homedir(), "");

            this.workspaces = await this.loadWorkspaces({ ...options, auth, packages: this.options.packages.map(this.normalizePattern), cwd: this.options.cwd }, 1);

            if (this.workspaces.size == 0)
            {
                this.logger.warn("No packages found.");
            }

            this.loaded = true;
        }

        return this.workspaces.size > 0;
    }

    private async loadEntry(path: string, options: LoadOptions, depth: number): Promise<[string, Entry]>
    {
        const content  = (await readFile(path)).toString();
        const manifest = JSON.parse(content) as object as PackageJson;

        this.backup.set(path, content);

        let workspaces: Map<string, Entry> | undefined;

        const parentPath = dirname(path);

        const auth: Auth = await this.getAuth(parentPath, manifest.name, options.auth);

        const tag = options.tag ?? "latest";

        if (Array.isArray(manifest.workspaces))
        {
            workspaces = depth > 0
                ? await this.loadWorkspaces({ ...options, auth, packages: manifest.workspaces.map(this.normalizePattern), cwd: parentPath }, depth - 1)
                : new Map();
        }

        const service = new NpmService(this.options.registry ?? auth.registry, this.options.token ?? auth.token);

        const spec = `${manifest.name}@${tag}`;

        const remote   = await service.get(spec);
        const modified = remote ? await service.hasChanges(`file:${parentPath}`, spec, { ignorePackageVersion: true, ignoreFiles: options.ignoreChanges ?? [] }) : true;

        const entry: Entry =
        {
            auth,
            manifest,
            modified,
            path,
            remote,
            service,
            workspaces,
        };

        return [manifest.name, entry];
    }

    private async getAuth(path: string, packageName: string, parent: Auth = { }): Promise<Auth>
    {
        let auth: Auth = parent;

        const config = await NpmConfig.load(path, process.env);

        if (config)
        {
            auth = { registry: config.registry ?? auth.registry, token: config.authToken ?? auth.token };

            if (packageName.startsWith("@"))
            {
                const [scope] = packageName.split("/");

                auth = config.getScopedAuth(scope!) ?? auth;
            }
        }

        return { registry: this.options.registry ?? auth.registry, token: this.options.token ?? auth.token };
    }

    private async runScript(manifest: PackageJson, script: ScriptType, cwd: string): Promise<void>
    {
        if (manifest.scripts?.[script])
        {
            this.logger.debug(`Running ${script} script in ${manifest.name}...`);

            await execute(`npm run ${script} --if-present --color`, { cwd });
        }
        else
        {
            this.logger.debug(`Script ${script} does not exists in ${manifest.name}, ignoring...`);
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

    private async publishPackage(tag: string, entry: Entry, options: PublishOptions): Promise<void>
    {
        const parentPath = dirname(entry.path);

        if (entry.workspaces?.size)
        {
            if (!this.options.dry)
            {
                await this.runScript(entry.manifest, "prepublishworkspace", parentPath);
            }

            await this.publishWorkspaces(tag, options, entry.workspaces);
        }

        if ((options.includePrivate || !entry.manifest.private) && (options.includeWorkspaceRoot || !entry.workspaces))
        {
            const versionedName = `${entry.manifest.name}@${entry.manifest.version}`;

            if (await entry.service.isPublished(entry.manifest))
            {
                this.logger[options.canary ? "debug" : "warn"](`${versionedName} already in registry, ignoring...`);
            }
            else if (!this.options.dry)
            {
                try
                {
                    await this.runScript(entry.manifest, "prepublish", parentPath);
                    await this.runScript(entry.manifest, "prepublishOnly", parentPath);
                    await this.runScript(entry.manifest, "prepack", parentPath);
                    await this.runScript(entry.manifest, "prepare", parentPath);

                    const buffer = await pack(parentPath);

                    await this.runScript(entry.manifest, "postpack", parentPath);

                    this.logger.debug(`Publishing ${versionedName}`);

                    await entry.service.publish(entry.manifest, buffer, tag);

                    await this.runScript(entry.manifest, "postpublish", parentPath);

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
            this.logger.debug(`Package ${entry.manifest.name} is ${entry.manifest.private ? "private" : "an workspace"}, publishing ignored...`);
        }

        if (!this.options.dry && entry.workspaces?.size)
        {
            await this.runScript(entry.manifest, "postpublishworkspace", parentPath);
        }
    }

    private async publishWorkspaces(tag: string, options: PublishOptions, workspaces: Map<string, Entry>): Promise<void>
    {
        this.logger.trace("Publishing workspaces...");
        const promises: Promise<void>[] = [];

        for (const entry of workspaces.values())
        {
            promises.push(this.publishPackage(tag, entry, options));
        }

        await Promise.all(promises);
    }

    private async restorePackages(): Promise<void>
    {
        for (const [key, value] of this.backup)
        {
            await writeFile(key, value);

            this.logger.debug(`Package ${key} restored!`);
        }
    }

    private async sync(entry: Entry, workspaces: Map<string, Entry>, options: BumpOptions, dependencyType?: "dependencies" | "devDependencies" | "peerDependencies"): Promise<void>
    {
        if (dependencyType)
        {
            const dependencies = entry.manifest[dependencyType];

            if (dependencies)
            {
                for (const [name, version] of Object.entries(dependencies))
                {
                    const isFileReference = version.startsWith("file:");
                    const dependency      = workspaces.get(name)?.manifest;

                    if (dependency || isFileReference)
                    {
                        let dependencyVersion: string | undefined;

                        if (dependency)
                        {
                            dependencyVersion = dependency.version;
                        }
                        else if (isFileReference)
                        {
                            const path    = join(resolve(dirname(entry.path), version.replace("file:", "")), "package.json");
                            const content = (await readFile(path)).toString();

                            dependencyVersion = (JSON.parse(content) as object as PackageJson).version;
                        }

                        if (dependencyVersion && (options.updateFileReferences && isFileReference) || options.synchronize && !isFileReference)
                        {
                            dependencies[name] = `~${dependencyVersion}`;

                            this.logger.debug(`${dependencyType}:${name} in ${entry.manifest.name} updated from '${version}' to '${dependencyVersion}'`);
                        }
                    }
                }
            }
        }
        else
        {
            await Promise.all
            ([
                this.sync(entry, workspaces, options, "dependencies"),
                this.sync(entry, workspaces, options, "devDependencies"),
                this.sync(entry, workspaces, options, "peerDependencies"),
            ]);
        }
    }

    private async writeWorkspaces(options: BumpOptions, workspaces: Map<string, Entry> = this.workspaces): Promise<void>
    {
        const promises: Promise<void>[] = [];

        for (const entry of workspaces.values())
        {
            let chain = Promise.resolve();

            if (options.synchronize || options.updateFileReferences)
            {
                chain = this.sync(entry, workspaces, options);
            }

            if (!this.options.dry)
            {
                if (options.force || entry.modified)
                {
                    promises.push(chain.then(async () => writeFile(entry.path, JSON.stringify(entry.manifest, null, 4))));
                }
            }
            else
            {
                this.logger.info(`Version ${entry.manifest.name}@${entry.manifest.version} will be written in ${entry.path}...`);
            }

            if (entry.workspaces)
            {
                promises.push(this.writeWorkspaces(options, entry.workspaces));
            }
        }

        await Promise.all(promises);
    }

    private async update(workspaces: Map<string, Entry>, version: Version, preid: string | undefined, build: string | undefined, options: BumpOptions = { }): Promise<void>
    {
        for (const entry of workspaces.values())
        {
            const manifest = entry.manifest;
            const actual   = manifest.version;

            if (options.force || !options.independent || entry.modified)
            {
                const updated: string | null = isSemanticVersion(version)
                    ? version
                    : isGlobPrerelease(version)
                        ? overridePrerelease(manifest.version, version)
                        : semver.inc(manifest.version, version, { loose: true }, preid);

                if (!updated)
                {
                    const message = `Packaged ${manifest.name} has invalid version ${manifest.version}`;

                    this.logger.error(message);

                    this.errors.push(new Error(message));
                }
                else
                {
                    manifest.version = updated + (build ? `+${build}` : "");

                    this.logger.debug(`${manifest.name} version updated from ${actual} to ${manifest.version}`);
                }
            }
            else if (entry.remote && entry.manifest.version != entry.remote.version)
            {
                this.logger.debug(`Package ${manifest.name} has no changes but local version (${manifest.version}) differ from remote version (${entry.remote.version}) using dist-tag ${options.tag ?? "latest"}`);

                manifest.version = entry.remote.version;
            }
            else
            {
                this.logger.debug(`Package ${manifest.name} has no changes`);
            }

            if (entry.workspaces?.size)
            {
                await this.update(entry.workspaces, options.independent ? version : entry.manifest.version as SemanticVersion, preid, build, options);
            }
        }
    }

    private async unpublishPackage(tag: string, entry: Entry, options: UnpublishOptions): Promise<void>
    {
        if ((options.includePrivate || !entry.manifest.private) && (options.includeWorkspaceRoot || !entry.workspaces))
        {
            const versionedName = `${entry.manifest.name}@${entry.manifest.version}`;

            if (!await entry.service.isPublished(entry.manifest))
            {
                this.logger.warn(`${versionedName} not in registry, ignoring...`);
            }
            else if (!this.options.dry)
            {
                try
                {
                    this.logger.debug(`Unpublishing ${versionedName}.`);

                    await entry.service.unpublish(entry.manifest, tag);

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
            this.logger.debug(`Package ${entry.manifest.name} is ${entry.manifest.private ? "private" : "an workspace"}, unpublishing ignored...`);
        }

        if (entry.workspaces?.size)
        {
            await this.unpublishWorkspaces(tag, entry.workspaces, options);
        }
    }

    private async unpublishWorkspaces(tag: string, workspaces: Map<string, Entry>, options: UnpublishOptions): Promise<void>
    {
        this.logger.trace("Unpublishing workspaces...");

        const promises: Promise<void>[] = [];

        for (const entry of workspaces.values())
        {
            promises.push(this.unpublishPackage(tag, entry, options));
        }

        await Promise.all(promises);
    }

    /**
     * Bump discovered packages using provided custom version.
     * @param version An semantic version or an release type: major, minor, patch, premajor, preminor, prepatch, prerelease.
     * Also can accept an glob prerelease '*-dev+123' to override just the prerelease part of the version. Useful for canary builds.
     * @param preid The 'prerelease identifier' part of a semver. Like the "rc" in 1.2.0-rc.8+2022.
     * @param build The build part of a semver. Like the "2022" in 1.2.0-rc.8+2022.
     */
    public async bump(version: Version, preid?: string, build?: string, options: BumpOptions = { }): Promise<void>
    {
        if (await this.loadWorkspaces({ tag: options.tag, ignoreChanges: options.ignoreChanges }))
        {
            this.logger.trace("Updating packages version...");
            await this.update(this.workspaces, version, preid, build, options);

            this.logger.trace("Writing packages...");
            await this.writeWorkspaces(options);

            if (this.errors.length > 0)
            {
                await this.restorePackages();

                this.logger.warn("Failed to bump some packages.");

                throw new AggregateError(this.errors);
            }
            else
            {
                this.logger.info(`${this.options.dry ? "[dry] " : ""}Bump done!`);
            }
        }
    }

    /**
     * List local packages that have changed compared to remote tagged package.
     * @param tag Tag used to compare local and remote packages.
     **/
    public async changed(tag: string, options: ChangedOptions = { }): Promise<string[]>
    {
        if (await this.loadWorkspaces({ tag, ignoreChanges: options.ignoreChanges }))
        {
            return this.changedWorkspaces(this.workspaces, options);
        }

        return [];
    }

    /**
     * Publish discovered packages.
     * @param tag Tag to publish.
     * @param options Publish options.
     */
    public async publish(tag: string, options: PublishOptions = { }): Promise<void>
    {
        if (await this.loadWorkspaces({ tag, ignoreChanges: options.ignoreChanges }))
        {
            const bumpOptions: BumpOptions =
            {
                force:                options.force,
                independent:          true,
                synchronize:          options.synchronize,
                updateFileReferences: true,
            };

            if (options.canary)
            {
                const build = options.build ?? timestamp();

                options.prereleaseType
                    ? await this.bump(options.prereleaseType, options.preid, build, bumpOptions)
                    : await this.bump(`*-${options.preid ?? "dev"}`, undefined, build, bumpOptions);
            }
            else
            {
                const keys: (keyof PublishOptions)[] = ["preid", "prereleaseType", "build"];

                for (const key of keys)
                {
                    if (options[key])
                    {
                        this.logger.warn(`Canary option is disabled, option ${key} will be ignored`);
                    }
                }

                await this.writeWorkspaces(bumpOptions);
            }

            await this.publishWorkspaces(tag, options, this.workspaces);

            if (!this.options.dry && (this.errors.length > 0 || options.canary))
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
                this.logger.info(`${this.options.dry ? "[dry] " : ""}Publishing Done!`);
            }
        }
    }

    /**
     * Unpublish discovered packages.
     * @param tag Tag to unpublish.
     * @param options Unpublish options.
     */
    public async unpublish(tag: string, options: UnpublishOptions = { }): Promise<void>
    {
        if (await this.loadWorkspaces())
        {
            await this.unpublishWorkspaces(tag, this.workspaces, options);

            if (this.errors.length > 0)
            {
                this.logger.warn("Unpublishing done with errors!");

                throw new AggregateError(this.errors);
            }
            else
            {
                this.logger.info(`${this.options.dry ? "[dry] " : ""}Unpublishing Done!`);
            }
        }
    }
}
