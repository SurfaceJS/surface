import chalk                        from "chalk";
import { IPackage }                 from "npm-registry-client";
import { filterPackages }           from "./common";
import NpmRepository, { Status }                from "./npm-repository";
import Version, { PrereleaseTypes } from "./version";

const blue      = chalk.rgb(0, 115, 230);
const darkGreen = chalk.rgb(0, 128, 0);
const green     = chalk.rgb(0, 255, 0);
const purple    = chalk.rgb(191, 0, 191);

export enum StrategyType
{
    Default          = 0,
    ForceUpdate      = 1,
    ForceVersion     = 2,
    IgnoreDependents = 4,
    OnlyStable       = 8,
}

export interface IOptions
{
    strategy?: StrategyType;
    silent?:   boolean;
    template?: string;
}

export default class Depsync
{
    private readonly  updated:    Set<IPackage> = new Set();
    private readonly  lookup:     Map<string, IPackage>;
    private readonly  repository: NpmRepository;
    private readonly  silent:     boolean;
    private readonly  strategy:   StrategyType;
    private readonly  template?:  string;

    public constructor(repository: NpmRepository, lookup: Map<string, IPackage>, options?: IOptions)
    {
        this.repository = repository;
        this.lookup     = lookup;

        // istanbul ignore next
        this.silent   = options?.silent   ?? false;
        // istanbul ignore next
        this.strategy = options?.strategy ?? StrategyType.Default;
        // istanbul ignore next
        this.template = options?.template;
    }

    // istanbul ignore next
    public static async sync(lookup: Map<string, IPackage>, modules?: Array<string>, options?: IOptions): Promise<Array<IPackage>>
    {
        return await new Depsync(new NpmRepository(), lookup, options).sync(modules);
    }

    private applyPlaceholder(placeholder: string|undefined, value: string|undefined): string|undefined
    {
        return placeholder == "*" ? value : placeholder;
    }

    private parseTemplate(source: string, template: string): Version
    {
        type RawVersion = [string, string, string, string?, string?];

        const [templateMajor, templateMinor, templateRevision, templatePreReleaseType, templatePreReleaseVersion] = template.split("-").map(x => x.split(".")).flat()  as RawVersion;
        const [sourceMajor,   sourceMinor,   sourceRevision,   sourcePreReleaseType,   sourcePreReleaseVersion]   = source.split("-").map(x => x.split(".")).flat() as RawVersion;

        const major             = Number(this.applyPlaceholder(templateMajor, sourceMajor));
        const minor             = Number(this.applyPlaceholder(templateMinor, sourceMinor));
        const revision          = Number(this.applyPlaceholder(templateRevision, sourceRevision));
        const preReleaseType    = this.applyPlaceholder(templatePreReleaseType, sourcePreReleaseType) as PrereleaseTypes|undefined;
        const preReleaseVersion = this.applyPlaceholder(templatePreReleaseVersion, sourcePreReleaseVersion);

        const version = new Version(major, minor, revision);

        if (preReleaseType && preReleaseVersion)
        {
            version.prerelease = { type: preReleaseType, version: Number(preReleaseVersion) };
        }

        return version;
    }

    private async hasUpdate($package: IPackage): Promise<boolean>
    {
        if (this.template)
        {
            const targetVersion = this.parseTemplate($package.version, this.template);

            if (this.hasStrategies(StrategyType.ForceVersion) || Version.compare(targetVersion, Version.parse($package.version)) == 1)
            {
                if (!targetVersion.prerelease || !this.hasStrategies(StrategyType.OnlyStable))
                {
                    const actual = $package.version;

                    $package.version = targetVersion.toString();

                    // istanbul ignore if
                    if (!this.silent)
                    {
                        console.log(`${chalk.bold.gray("[UPDATE]:")}  ${blue($package.name)} - ${darkGreen(actual)} >> ${green($package.version)}`);
                    }
                }
            }
        }

        if (await this.repository.getStatus($package) != Status.InRegistry)
        {
            this.updated.add($package);

            return true;
        }

        return false;
    }

    private hasStrategies(...strategies: Array<StrategyType>): boolean
    {
        return strategies.every(x => (this.strategy & x) == x);
    }

    private async updateDependents($package: IPackage): Promise<void>
    {
        if ((this.hasStrategies(StrategyType.OnlyStable) && Version.parse($package.version).prerelease))
        {
            return;
        }

        const dependentPackages = Array.from(this.lookup.values())
            .filter(x => !!x.dependencies?.[$package.name] || !!x.devDependencies?.[$package.name])
            .filter(x => (x.dependencies?.[$package.name] ?? x.devDependencies![$package.name]) != $package.version);

        for (const dependent of dependentPackages)
        {
            const version = dependent.dependencies?.[$package.name] ?? dependent.devDependencies![$package.name];

            if (dependent.dependencies?.[$package.name])
            {
                dependent.dependencies[$package.name] = $package.version;
            }
            else
            {
                dependent.devDependencies![$package.name] = $package.version;
            }

            // istanbul ignore if
            if (!this.silent)
            {
                console.log(`${chalk.bold.gray("[UPDATE]:")} ${blue($package.name)} dependency in ${blue(dependent.name)} - ${darkGreen(version)} >> ${green($package.version)}`);
            }

            if (!this.updated.has(dependent) && await this.repository.getStatus(dependent) == Status.InRegistry)
            {
                this.updated.add(dependent);

                this.update(dependent);

                await this.updateDependents(dependent);
            }
        }
    }

    private update($package: IPackage): void
    {
        const version = Version.parse($package.version);

        if (version.prerelease)
        {
            version.prerelease.version++;
        }
        else
        {
            version.revision++;
        }

        const actual = $package.version;

        $package.version = version.toString();

        // istanbul ignore if
        if (!this.silent)
        {
            console.log(`${chalk.bold.gray("[UPDATE]:")}  ${blue($package.name)} - ${darkGreen(actual)} >> ${green($package.version)}`);
        }
    }

    public async sync(modules: Array<string> = []): Promise<Array<IPackage>>
    {
        // istanbul ignore if
        if (this.template && !this.silent)
        {
            console.log(`[INFO]: Sync using target version ${purple(this.template)}`);
        }

        const packages = filterPackages(this.lookup.values(), modules);

        const updateList = await Promise.all(packages.map(async x => ({ updated: await this.hasUpdate(x), package: x })));

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