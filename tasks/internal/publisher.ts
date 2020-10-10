import fs                                       from "fs";
import path                                     from "path";
import { Stream }                               from "stream";
import { promisify }                            from "util";
import chalk                                    from "chalk";
import glob                                     from "glob";
import { Credential, IPackage, IPublishParams } from "npm-registry-client";
import { ICreateOptions, create }               from "tar";
import { filterPackages, log, paths }           from "./common";
import Status                                   from "./enums/status";
import NpmRepository                            from "./npm-repository";
import Version                                  from "./version";

const globAsync     = promisify(glob);
const readdirAsync  = promisify(fs.readdir);
const readFileAsync = promisify(fs.readFile);

type Access = IPublishParams["access"];

const DEFAULT_IGNORES = [".npmignore", "package-lock.json", "**/*.orig", "**/package.json.backup"];

export default class Publisher
{
    private readonly access:     Access;
    private readonly auth:       Credential;
    private readonly debug:      boolean;
    private readonly lookup:     Map<string, IPackage>;
    private readonly published:  Set<IPackage> = new Set();
    private readonly repository: NpmRepository = new NpmRepository();

    public constructor(lookup: Map<string, IPackage>, repository: NpmRepository, auth: Credential, access: Access = "public", debug: boolean = false)
    {
        this.lookup     = lookup;
        this.repository = repository;
        this.auth       = auth;
        this.access     = access;
        this.debug      = debug;
    }

    private async collectFiles(folderpath: string): Promise<string[]>
    {
        const npmignorePath = path.join(folderpath, ".npmignore");

        if (fs.existsSync(npmignorePath))
        {
            const options: glob.IOptions = { cwd: folderpath, nodir: true, root: folderpath };

            const promises = DEFAULT_IGNORES.concat((await readFileAsync(npmignorePath)).toString().split("\n"))
                .map(async x => globAsync(x.trim(), options));

            const patterns = (await Promise.all(promises))
                .filter(x => x.length > 0)
                .flat()
                .filter(x => !x.startsWith("node_modules"));

            const exclude = new Set(patterns);

            return (await globAsync("**/**", options))
                .filter(x => !x.startsWith("node_modules") && !exclude.has(x));
        }

        return (await readdirAsync(folderpath))
            .map(x => path.join(folderpath, x));
    }

    private async createBody(packageName: string): Promise<Stream>
    {
        const folderpath = path.join(paths.source.root, packageName);
        const files      = (await this.collectFiles(folderpath)).map(x => x.replace("@", "./@"));

        log(`Collected files:\n    ${chalk.bold.blue(packageName)}\n${files.map(x => `        |--/${x}`).join("\n")}`);

        const options: ICreateOptions = { cwd: folderpath.replace("@", "./@"), gzip: true, prefix: "package" };

        return await create(options, files);
    }

    public async publish(modules: string[] = []): Promise<void>
    {
        const packages = filterPackages(this.lookup.values(), modules);

        for (const $package of packages)
        {
            if (await this.repository.getStatus($package) == Status.InRegistry)
            {
                log(`${chalk.bold.blue($package.name)} is updated`);
            }
            else if (!this.published.has($package))
            {
                if ($package.dependencies)
                {
                    const dependencies = Object.keys($package.dependencies)
                        .filter(x => x.startsWith("@surface/"));

                    if (dependencies.length > 0)
                    {
                        await this.publish(dependencies);
                    }
                }

                const body = await this.createBody($package.name);

                log(`Publishing ${$package.name}`);

                if (!this.debug)
                {
                    await this.repository.publish(encodeURIComponent($package.name), { access: this.access, auth: this.auth, body, metadata: $package });
                }

                const version = Version.parse($package.version);

                if (version.prerelease)
                {
                    const tag = version.prerelease.type == "dev" ? "next" : version.prerelease.type;

                    log(`Adding tag ${tag}`);

                    if (!this.debug)
                    {
                        await this.repository.addTag(encodeURIComponent($package.name), { auth: this.auth, distTag: tag, package: $package.name, version: $package.version });
                    }
                }

                this.published.add($package);
            }
        }
    }
}