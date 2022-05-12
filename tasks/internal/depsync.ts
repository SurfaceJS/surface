import { Version }              from "@surface/core";
import chalk                    from "chalk";
import type { Manifest }        from "pacote";
import Status                   from "./enums/status.js";
import StrategyType             from "./enums/strategy-type.js";
import NpmRepository            from "./npm-repository.js";

const blue      = chalk.rgb(0, 115, 230);
const darkGreen = chalk.rgb(0, 128, 0);
const green     = chalk.rgb(0, 255, 0);
const purple    = chalk.rgb(191, 0, 191);

export type Options =
{
    strategy?: StrategyType,
    silent?:   boolean,
    version?:  `${string}.${string}.${string}`,
};

export default class Depsync
{
    private readonly  updated:    Set<Manifest> = new Set();
    private readonly  lookup:     Map<string, Manifest>;
    private readonly  repository: NpmRepository;
    private readonly  silent:     boolean;
    private readonly  strategy:   StrategyType;
    private readonly  template?:  string;

    public constructor(repository: NpmRepository, lookup: Map<string, Manifest>, options?: Options)
    {
        this.repository = repository;
        this.lookup     = lookup;

        // c8 ignore next
        this.silent   = options?.silent   ?? false;
        // c8 ignore next
        this.strategy = options?.strategy ?? StrategyType.Default;
        // c8 ignore next
        this.template = options?.version;
    }

    // c8 ignore next
    public static async sync(lookup: Map<string, Manifest>, options?: Options): Promise<Manifest[]>
    {
        return new Depsync(new NpmRepository(), lookup, options).sync();
    }

    private applyPlaceholder(placeholder: string | undefined, value: string | undefined): string | undefined
    {
        return placeholder == "*" ? value : placeholder;
    }

    private parseTemplate(source: string, template: string): Version
    {
        type RawVersion = [string, string, string, string?, string?];

        const [templateMajor, templateMinor, templateRevision] = template.split("-").map(x => x.split("."))
            .flat() as RawVersion;

        const [sourceMajor, sourceMinor, sourceRevision] = source.split("-").map(x => x.split("."))
            .flat() as RawVersion;

        const major    = Number(this.applyPlaceholder(templateMajor, sourceMajor));
        const minor    = Number(this.applyPlaceholder(templateMinor, sourceMinor));
        const revision = Number(this.applyPlaceholder(templateRevision, sourceRevision));

        const version = new Version(major, minor, revision);

        // if (preReleaseType && preReleaseVersion)
        // {
        //     // version.prerelease = { type: preReleaseType, version: Number(preReleaseVersion) };
        // }

        return version;
    }

    private async hasUpdate(manifest: Manifest): Promise<boolean>
    {
        if (this.template)
        {
            const targetVersion = this.parseTemplate(manifest.version, this.template);

            if (this.hasStrategies(StrategyType.ForceVersion) || Version.compare(targetVersion, Version.parse(manifest.version)) == 1)
            {
                if (!targetVersion.prerelease || !this.hasStrategies(StrategyType.OnlyStable))
                {
                    const actual = manifest.version;

                    manifest.version = targetVersion.toString();

                    // c8 ignore if
                    if (!this.silent)
                    {
                        console.log(`${chalk.bold.gray("[UPDATE]:")} ${blue(manifest.name)} - ${darkGreen(actual)} >> ${green(manifest.version)}`);
                    }
                }
            }
        }

        if (await this.repository.getStatus(manifest) != Status.InRegistry)
        {
            this.updated.add(manifest);

            return true;
        }

        return false;
    }

    private hasStrategies(...strategies: StrategyType[]): boolean
    {
        return strategies.every(x => (this.strategy & x) == x);
    }

    private async updateDependents(manifest: Manifest, dependencyType?: "dependencies" | "devDependencies" | "peerDependencies"): Promise<void>
    {
        if (dependencyType)
        {
            const dependentPackages = Array.from(this.lookup.values())
                .filter(x => !!x[dependencyType]?.[manifest.name] && x[dependencyType]?.[manifest.name] != manifest.version);

            for (const dependent of dependentPackages)
            {
                const version = dependent[dependencyType]![manifest.name];

                dependent[dependencyType]![manifest.name] = `~${manifest.version}`;

                // c8 ignore if
                if (!this.silent)
                {
                    console.log(`${chalk.bold.gray("[UPDATE]:")} ${blue(manifest.name)} ${dependencyType} in ${blue(dependent.name)} - ${darkGreen(version)} >> ${green(manifest.version)}`);
                }

                if (!this.updated.has(dependent))
                {
                    if (await this.repository.getStatus(dependent) == Status.InRegistry)
                    {
                        this.update(dependent);
                    }

                    this.updated.add(dependent);

                    await this.updateDependents(dependent);
                }
            }
        }
        else if (!(this.hasStrategies(StrategyType.OnlyStable) && Version.parse(manifest.version).prerelease))
        {
            await this.updateDependents(manifest, "dependencies");
            await this.updateDependents(manifest, "devDependencies");
            await this.updateDependents(manifest, "peerDependencies");
        }
    }

    private update(manifest: Manifest): void
    {
        const version = Version.parse(manifest.version);

        // if (version.prerelease)
        // {
        //     version.prerelease.version++;
        // }
        // else
        // {
        version.patch++;
        // }

        const actual = manifest.version;

        manifest.version = version.toString();

        // c8 ignore if
        if (!this.silent)
        {
            console.log(`${chalk.bold.gray("[UPDATE]:")} ${blue(manifest.name)} - ${darkGreen(actual)} >> ${green(manifest.version)}`);
        }
    }

    public async sync(): Promise<Manifest[]>
    {
        // c8 ignore if
        if (this.template && !this.silent)
        {
            console.log(`[INFO]: Sync using target version ${purple(this.template)}`);
        }

        const packages = Array.from(this.lookup.values());

        const updateList = await Promise.all(packages.map(async x => ({ package: x, updated: await this.hasUpdate(x) })));

        if (!this.hasStrategies(StrategyType.IgnoreDependents))
        {
            for (const entry of updateList)
            {
                if (entry.updated)
                {
                    await this.updateDependents(entry.package);
                }
            }
        }

        return Array.from(this.updated.values());
    }
}