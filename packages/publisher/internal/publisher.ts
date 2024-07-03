/* eslint-disable max-lines */
import { readFile, writeFile }              from "fs/promises";
import os                                   from "os";
import { dirname, join, resolve }           from "path";
import type { PackageJson as _PackageJson } from "@npm/types";
import { type RequiredProperties }          from "@surface/core";
import Logger, { LogLevel }                 from "@surface/logger";
import { enumeratePaths, execute }          from "@surface/rwx";
import pack                                 from "libnpmpack";
import type pacote                          from "pacote";
import semver, { type ReleaseType }         from "semver";
import
{
    changelog,
    getEnv,
    isGlobPrerelease,
    isSemanticVersion,
    overridePrerelease,
    recommendedBump,
    timestamp,
} from "./common.js";
import { addTag, commitAll, getRemoteUrl, isWorkingTreeClean, pushToRemote } from "./git.js";
import loadConfig                                                            from "./load-config.js";
import NpmService                                                            from "./npm-service.js";
import ReleaseClient                                                         from "./release-client.js";
import type { GlobPrerelease, SemanticVersion }                              from "./types/version.js";

/* cSpell:ignore preid, premajor, preminor, prepatch, postpack, postpublish */

type Pre<T extends string> = T extends `pre${string}` ? T : never;

type PackageJson = _PackageJson & { workspaces?: string[] };

class Entry
{
    private _workspaces?: Map<string, Entry>;
    public readonly hasChanges:      boolean;
    public readonly isRoot:          boolean;
    public readonly manifest:        PackageJson;
    public readonly parent?:         Entry;
    public readonly path:            string;
    public readonly remote:          Pick<PackageJson, "name" | "version"> | null;
    public readonly root:            Entry;
    public readonly service:         NpmService;

    public get isWorkspaceRoot(): boolean
    {
        return this.isRoot && !!this._workspaces;
    }

    public get workspaces(): Map<string, Entry> | undefined
    {
        return this._workspaces;
    }

    public set workspaces(value: Map<string, Entry> | undefined)
    {
        this._workspaces = value;
    }

    public constructor(values: Pick<Entry, Exclude<keyof Entry, "isRoot" | "parent" | "root" | "workspaces" | "isWorkspaceRoot">>, parent?: Entry)
    {
        this.hasChanges = values.hasChanges;
        this.isRoot     = !parent?.root;
        this.manifest   = values.manifest;
        this.parent     = parent;
        this.path       = values.path;
        this.remote     = values.remote;
        this.root       = parent?.root ?? this;
        this.service    = values.service;
    }
}

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
    config?:        pacote.Options,
    cwd?:           string,
    ignoreChanges?: string[],
    packages?:      string[],
    tag?:           string,
};

type RestrictionOptions =
{

    /** Includes private packages. */
    includePrivate?: boolean,
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

    /** Generates changelog after bumping. */
    changelog?: boolean,

    /** Commit changes. */
    commit?: boolean,

    /** Push commit to remote. */
    pushToRemote?: boolean,

    /** Git remote. */
    remote?: string,

    /** Creates a github or gitlab release with the generated changes. */
    createRelease?: "github" | "gitlab",
} & Pick<ChangedOptions, "ignoreChanges" | "includePrivate">;

export type ChangedOptions =
{

    /** Files to ignore when detecting changes. */
    ignoreChanges?: string[],

    /** Tag used to compare local and remote packages. */
    tag?: string,
} & RestrictionOptions;

export type PublishOptions =
{

    /** Semantic version build. Used by canary. */
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

    /** Tag to publish. */
    tag?: string,
} & ChangedOptions & RestrictionOptions;

export type UnpublishOptions = RestrictionOptions;

export type Version = SemanticVersion | GlobPrerelease | ReleaseType | "recommended";

export default class Publisher
{
    private readonly backup:  Map<string, string> = new Map();
    private readonly errors:  Error[]             = [];
    private readonly logger:  Logger;
    private readonly options: RequiredProperties<Options, "cwd" | "packages">;
    private readonly updates: Entry[] = [];

    private loaded:  boolean            = false;
    private entries: Map<string, Entry> = new Map();

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
            if (entry.hasChanges && this.isPublishable(entry, options))
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

    private async createReleases(options: BumpOptions, changes: Map<string, string>, getTag: (entry: Entry) => string): Promise<void>
    {
        if (!this.options.dry)
        {
            this.logger.trace("Creating releases...");

            const promises: Promise<void>[] = [];

            const env = getEnv();

            const [apiUrl, token] = options.createRelease == "github"
                ? [env.GITHUB_API, env.GITHUB_TOKEN]
                : [env.GITLAB_API, env.GITLAB_TOKEN];

            if (!token)
            {
                throw new Error("Api token is required");
            }

            const remoteUrl          = await getRemoteUrl(options.remote ?? "origin");
            const url                = new URL(remoteUrl.trim().replace(/^git@/, "https://").replace(/\.git$/, ""));
            const [, owner, ...rest] = url.pathname.split("/") as string[];
            const project            = rest.join("/");
            const client             = new ReleaseClient({ type: options.createRelease!, apiUrl, token, owner: owner!, project }, this.logger);

            for (const entry of this.updates)
            {
                const action = async (): Promise<void> =>
                {
                    if (options.independent || entry.isWorkspaceRoot || entry.isRoot)
                    {
                        this.logger.debug(`Creating ${entry.manifest.name}'s release.`);

                        const content = changes.get(entry.manifest.name)!;
                        const tag = getTag(entry);

                        await client.createRelease(tag, content);
                    }
                };

                promises.push(action());
            }

            await Promise.all(promises);

            this.logger.trace("Releases created...");
        }

        else
        {
            this.logger.info(`Releases will created on ${options.createRelease}...`);
        }
    }

    private async generateArtifacts(options: BumpOptions): Promise<void>
    {
        const changes = new Map<string, string>();

        const getTag = (entry: Entry): string => options.independent || this.entries.size > 1
            ? `${entry.manifest.name}@${entry.manifest.version}`
            : `v${entry.manifest.version}`;

        if (options.changelog || options.createRelease)
        {
            if (options.changelog)
            {
                this.logger.trace("Generating changelogs...");
            }

            const promises: Promise<void>[] = [];

            for (const entry of this.updates)
            {
                const action = async (): Promise<void> =>
                {
                    if (options.independent || entry.isWorkspaceRoot || entry.isRoot)
                    {
                        const changelogPath = join(dirname(entry.path), "CHANGELOG.md");

                        if (!this.options.dry)
                        {
                            this.logger.debug(`creating ${entry.manifest.name}'s changelog.`);

                            const content = await changelog(entry.path, getTag(entry));

                            changes.set(entry.manifest.name, content.toString());

                            if (options.changelog)
                            {
                                await writeFile(changelogPath, content);
                            }

                            this.logger.debug(`${entry.manifest.name}'s changelog created.`);
                        }
                        else
                        {
                            changes.set(entry.manifest.name, "");
                            this.logger.info(`${entry.manifest.name}'s changelog will be created.`);
                        }
                    }
                };

                promises.push(action());
            }

            await Promise.all(promises);
        }

        if (options.createRelease || options.commit)
        {
            const tags: string[] = [];

            for (const entry of this.updates)
            {
                if (!options.includePrivate || entry.manifest.private)
                {
                    tags.push(getTag(entry));
                }
            }

            if (!this.options.dry)
            {
                const commitMessage = `chore(release): publish\n\n${tags.map(x => ` - ${x}`).join("\r\n")}`;

                this.logger.trace("Committing changes...");
                await commitAll(commitMessage);

                this.logger.trace("Adding tags...");
                await Promise.all(tags.map(async (x) => addTag(x, x)));
            }
            else
            {
                this.logger.info("Changes will be committed.");
                this.logger.info(`Tags will be created\n${tags.join("\n")}`);
            }

            if (options.createRelease || options.pushToRemote)
            {
                if (!this.options.dry)
                {
                    this.logger.trace("Pushing to remote...");
                    await pushToRemote(options.remote);
                }

                else
                {
                    this.logger.info(`Commit will be pushed to remote ${options.remote}.`);
                }
            }

            if (options.createRelease)
            {
                await this.createReleases(options, changes, getTag);
            }
        }
    }

    private async getConfig(path: string, parent?: Record<string, unknown>): Promise<pacote.Options>
    {
        const config = await loadConfig(path, process.env);

        if (config)
        {
            return { ...parent, ...config };
        }

        /* c8 ignore next */
        return parent ?? { };
    }

    private isUpdatable(entry: Entry, options: BumpOptions): boolean
    {
        return (options.includePrivate || !entry.manifest.private) && (!options.independent || !entry.isWorkspaceRoot);
    }

    private isPublishable(entry: Entry, options: PublishOptions): boolean
    {
        return !entry.isWorkspaceRoot && (options.includePrivate || !entry.manifest.private);
    }

    private async loadWorkspaces(options?: Pick<LoadOptions, "tag" | "ignoreChanges">): Promise<boolean>;
    private async loadWorkspaces(options: LoadOptions, parent?: Entry): Promise<Map<string, Entry>>;
    private async loadWorkspaces(options: LoadOptions = { }, parent: Entry | undefined = undefined): Promise<boolean | Map<string, Entry>>
    {
        if (options.packages && options.cwd)
        {
            const promises: Promise<[string, Entry]>[] = [];

            for await (const path of enumeratePaths(options.packages, { base: options.cwd }))
            {
                promises.push(this.loadEntry(path, options, parent));
            }

            return new Map<string, Entry>(await Promise.all(promises));
        }

        if (!this.loaded)
        {
            this.logger.trace("Loading workspaces...");

            const parentConfig: Record<string, unknown> = { };

            if (this.options.registry)
            {
                parentConfig.registry = this.options.registry;

                if (this.options.token)
                {
                    parentConfig[`${this.options.registry.replace(/(^https?:|\/$)/ig, "")}/:_authToken`] = this.options.token;
                }
            }
            else if (this.options.token)
            {
                parentConfig.registry                            = "https://registry.npmjs.org";
                parentConfig["//registry.npmjs.org/:_authToken"] = this.options.token;
            }

            const config = await this.getConfig(os.homedir(), parentConfig);

            this.entries = await this.loadWorkspaces({ ...options, config, packages: this.options.packages.map(this.normalizePattern), cwd: this.options.cwd });

            if (this.entries.size == 0)
            {
                this.logger.warn("No packages found.");
            }

            this.loaded = true;
        }

        return this.entries.size > 0;
    }

    private async loadEntry(path: string, options: LoadOptions, parent?: Entry): Promise<[string, Entry]>
    {
        const content  = (await readFile(path)).toString();
        const manifest = JSON.parse(content) as object as PackageJson;

        this.backup.set(path, content);

        const parentPath = dirname(path);

        const config = await this.getConfig(parentPath, options.config);

        const tag = options.tag ?? "latest";

        const service = new NpmService(config);

        const spec = `${manifest.name}@${tag}`;

        const remote     = await service.get(spec);
        const hasChanges = remote ? await service.hasChanges(`file:${parentPath}`, spec, { ignorePackageVersion: true, ignoreFiles: options.ignoreChanges ?? [] }) : true;

        const entry = new Entry
        (
            {
                hasChanges,
                manifest,
                path,
                remote,
                service,
            },
            parent,
        );

        if (Array.isArray(manifest.workspaces))
        {
            const loadOptions =
            {
                ...options,
                config,
                packages: manifest.workspaces.map(this.normalizePattern),
                cwd:      parentPath,
            };

            entry.workspaces = entry.isRoot ? await this.loadWorkspaces(loadOptions, entry) : undefined;
        }

        return [manifest.name, entry];
    }

    private async runScript(manifest: PackageJson, script: ScriptType, cwd: string): Promise<void>
    {
        if (manifest.scripts?.[script])
        {
            this.logger.debug(`Running ${script} script in ${manifest.name}...`);

            await execute(`npm run ${script} --if-present --color`, { cwd })
                .catch
                (
                    error =>
                    {
                        const message = `Script failed: ${script} - ${error.message}`;

                        this.logger.error(message);
                        this.errors.push(new Error(message));
                    },
                );
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

        if (this.isPublishable(entry, options))
        {
            if (options.force || entry.hasChanges)
            {
                const versionedName = `${entry.manifest.name}@${entry.manifest.version}`;

                if (entry.manifest.version == entry.remote?.version)
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
                this.logger.trace(`Package ${entry.manifest.name} has no changes.`);
            }
        }
        else
        {
            this.logger.trace(`Package ${entry.manifest.name} is ${entry.manifest.private ? "private" : "an workspace"}, publishing ignored...`);
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

                            this.logger.debug(`${dependencyType}:${name} in ${entry.manifest.name} updated from '${version}' to '~${dependencyVersion}'`);
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

    private throwAggregateError(): never
    {
        throw new AggregateError(this.errors, "One or more errors occurred");
    }

    private async writeWorkspaces(options: BumpOptions, workspaces: Map<string, Entry> = this.entries): Promise<void>
    {
        const promises: Promise<void>[] = [];

        for (const entry of workspaces.values())
        {
            let chain = Promise.resolve();

            if (options.synchronize || options.updateFileReferences)
            {
                chain = this.sync(entry, workspaces, options);
            }

            if (this.isUpdatable(entry, options))
            {
                if (options.force || entry.hasChanges)
                {
                    if (!this.options.dry)
                    {
                        promises.push(chain.then(async () => writeFile(entry.path, JSON.stringify(entry.manifest, null, 4))));
                    }
                    else
                    {
                        this.logger.info(`Version ${entry.manifest.name}@${entry.manifest.version} will be written in ${entry.path}...`);
                    }
                }
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
        const promises: Promise<void>[] = [];

        for (const entry of workspaces.values())
        {
            const action = async (): Promise<void> =>
            {
                if (this.isUpdatable(entry, options))
                {
                    const manifest = entry.manifest;
                    const actual   = manifest.version;

                    if (options.force || !options.independent || entry.hasChanges)
                    {
                        let manifestVersion = version;

                        if (manifestVersion == "recommended")
                        {
                            const result = await recommendedBump(dirname(entry.path), manifest.name);

                            if (!result.releaseType)
                            {
                                return;
                            }

                            manifestVersion = result.releaseType;
                        }

                        const updated: string | null = isSemanticVersion(manifestVersion)
                            ? manifestVersion
                            : isGlobPrerelease(manifestVersion)
                                ? overridePrerelease(manifest.version, manifestVersion)
                                : semver.inc(manifest.version, manifestVersion, { loose: true }, preid);

                        if (!updated)
                        {
                            const message = `Packaged ${manifest.name} has invalid version ${manifest.version}`;

                            this.logger.error(message);

                            this.errors.push(new Error(message));
                        }
                        else
                        {
                            manifest.version = updated + (build ? `.${build}` : "");

                            this.logger.debug(`${manifest.name} version updated from ${actual} to ${manifest.version}`);

                            this.updates.push(entry);
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
                }

                if (entry.workspaces?.size)
                {
                    await this.update(entry.workspaces, options.independent ? version : entry.manifest.version as SemanticVersion, preid, build, options);
                }
            };

            promises.push(action());
        }

        await Promise.all(promises);
    }

    private async unpublishPackage(entry: Entry, options: UnpublishOptions): Promise<void>
    {
        if (this.isPublishable(entry, options))
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

                    await entry.service.unpublish(versionedName);

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
            await this.unpublishWorkspaces(entry.workspaces, options);
        }
    }

    private async unpublishWorkspaces(workspaces: Map<string, Entry>, options: UnpublishOptions): Promise<void>
    {
        this.logger.trace("Unpublishing workspaces...");

        const promises: Promise<void>[] = [];

        for (const entry of workspaces.values())
        {
            promises.push(this.unpublishPackage(entry, options));
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
    // eslint-disable-next-line max-lines-per-function
    public async bump(version: Version, preid?: string, build?: string, options: BumpOptions = { }): Promise<void>
    {
        if (options.commit && !await isWorkingTreeClean())
        {
            throw new Error("Working tree has uncommitted changes");
        }

        if (await this.loadWorkspaces({ tag: options.tag, ignoreChanges: options.ignoreChanges }))
        {
            this.logger.trace("Updating packages version...");
            await this.update(this.entries, version, preid, build, options);

            this.logger.trace("Writing packages...");
            await this.writeWorkspaces(options);
            await this.generateArtifacts(options);

            if (this.errors.length > 0)
            {
                await this.restorePackages();

                this.logger.warn("Failed to bump some packages.");

                this.throwAggregateError();
            }

            const message = this.updates.length > 0
                ? "Bump done!"
                : "Nothing to bump.";

            this.logger.info(`${this.options.dry ? "[DRY RUN] " : ""}${message}`);
        }
    }

    /**
     * List local packages that have changed compared to remote tagged package.
     **/
    public async changed(options: ChangedOptions = { }): Promise<string[]>
    {
        if (await this.loadWorkspaces({ tag: options.tag, ignoreChanges: options.ignoreChanges }))
        {
            return this.changedWorkspaces(this.entries, options);
        }

        return [];
    }

    /**
     * Publish discovered packages.
     * @param tag Tag to publish.
     * @param options Publish options.
     */
    public async publish(options: PublishOptions = { }): Promise<void>
    {
        const tag = options.tag ?? (options.canary ? "next" : "latest");

        if (options.force)
        {
            this.logger.warn("Publishing using force mode");
        }

        if (await this.loadWorkspaces({ tag, ignoreChanges: options.ignoreChanges }))
        {
            const bumpOptions: BumpOptions =
            {
                force:                options.force,
                independent:          true,
                synchronize:          options.synchronize,
                tag,
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

            await this.publishWorkspaces(tag, options, this.entries);

            if (!this.options.dry && (this.errors.length > 0 || options.canary))
            {
                await this.restorePackages();
            }

            if (this.errors.length > 0)
            {
                this.logger.warn("Publishing done with errors!");

                this.throwAggregateError();
            }
            else
            {
                this.logger.info(`${this.options.dry ? "[DRY RUN] " : ""}Publishing Done!`);
            }
        }
    }

    /**
     * Unpublish discovered packages.
     * @param options Unpublish options.
     */
    public async unpublish(options: UnpublishOptions = { }): Promise<void>
    {
        if (await this.loadWorkspaces())
        {
            await this.unpublishWorkspaces(this.entries, options);

            if (this.errors.length > 0)
            {
                this.logger.warn("Unpublishing done with errors!");

                this.throwAggregateError();
            }
            else
            {
                this.logger.info(`${this.options.dry ? "[DRY RUN] " : ""}Unpublishing Done!`);
            }
        }
    }
}

