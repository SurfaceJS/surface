import path                from "path";
import chalk               from "chalk";
import pack                from "libnpmpack";
import type { Manifest }   from "pacote";
import semver              from "semver";
import { log, paths }      from "./common.js";
import Status              from "./enums/status.js";
import type NpmRepository  from "./npm-repository.js";

export default class Publisher
{
    private readonly dry:        boolean;
    private readonly lookup:     Map<string, Manifest>;
    private readonly published:  Set<Manifest> = new Set();
    private readonly repository: NpmRepository;

    public constructor(repository: NpmRepository, lookup: Map<string, Manifest>, dry: boolean = false)
    {
        this.lookup     = lookup;
        this.repository = repository;
        this.dry        = dry;
    }

    public async publish(modules?: string[]): Promise<void>
    {
        const packages = modules ? modules.map(x => this.lookup.get(x)!) : this.lookup.values();

        for (const manifest of packages)
        {
            if (await this.repository.getStatus(manifest) == Status.InRegistry)
            {
                log(`${chalk.bold.blue(manifest.name)} is updated`);
            }
            else if (!this.published.has(manifest))
            {
                if (manifest.dependencies)
                {
                    const dependencies = Object.keys(manifest.dependencies)
                        .filter(x => x.startsWith("@surface/"));

                    if (dependencies.length > 0)
                    {
                        await this.publish(dependencies);
                    }
                }

                const folderPath = path.join(paths.packages.root, manifest.name);

                const buffer = await pack(folderPath);

                log(`Publishing ${manifest.name}`);

                if (!this.dry)
                {
                    const tag = semver.prerelease(manifest.version)
                        ? "next"
                        : "latest";

                    await this.repository.publish(manifest, buffer, tag);
                }

                this.published.add(manifest);
            }
        }
    }
}
