import fs          from "fs";
import path        from "path";
import * as common from "./common";
import IPackage    from "./interfaces/package";
import packages    from "./common/packages";
import patterns    from "./common/patterns";

export default class Publisher
{
    private versions:  { [key: string]: string } = { };
    private toPublish: Array<IPackage>           = [];

    private checkVersion($package: IPackage)
    {
        if(!this.versions[$package.name])
        {
            this.versions[$package.name] = $package.version;
            this.toPublish.push($package);
        }

        if (this.isUpdated($package))
        {
            this.toPublish.push($package);
            this.versions[$package.name] = $package.version;
        }
    }

    private checkDependencies($package: IPackage)
    {
        for (const dependee of packages.filter(x => x.dependencies && !!x.dependencies[$package.name]))
        {
            if (this.toPublish.findIndex(x => x.name == dependee.name && x.dependencies[$package.name] == $package.version) == -1)
            {
                dependee.dependencies[$package.name] = $package.version;

                if (this.toPublish.findIndex(x => x.name == dependee.name) == -1)
                {
                    this.updateVersion(dependee);

                    this.versions[dependee.name] = dependee.version;

                    this.toPublish.push(dependee);
                }

                this.checkDependencies(dependee);
            }
        }
    }

    private isUpdated($package: IPackage)
    {
        const [targetMajor, targetMinor, targetRevision] = $package.version.split(".").map(x => Number.parseInt(x));
        const [storedMajor, storedMinor, storedRevision] = this.versions[$package.name].split(".").map(x => Number.parseInt(x));

        return (targetMajor > storedMajor)
            || (targetMajor == storedMajor && targetMinor  > storedMinor)
            || (targetMajor == storedMajor && targetMinor == storedMinor && targetRevision > storedRevision);
    }

    private async publish()
    {
        const token = fs.readFileSync(path.normalize(`${process.env.USERPROFILE}/.npmrc`)).toString().replace("\n", "");
    
        const versionsFile = path.resolve(__dirname, "./versions.json");
    
        if (fs.existsSync(versionsFile))
        {
            this.versions = require(versionsFile);
        }
    
        packages.forEach(this.checkVersion.bind(this));
        this.toPublish.forEach(this.checkDependencies.bind(this));
    
        for (const $package of this.toPublish)
        {
            fs.writeFileSync(path.resolve($package.path, "package.json"), JSON.stringify($package, null, 4));
    
            common.cleanup($package.path, patterns.clean.include, patterns.clean.exclude);
            await common.execute(`Compiling ${$package.path}`, `tsc -p ${$package.path} --noEmit false --declaration true`);
    
            await common.execute(`Publishing ${$package.name}:`, `npm set ${token} & cd ${$package.path} && npm publish --access public`);
        }
    
        if (this.toPublish.length > 0)
        {
            fs.writeFileSync(versionsFile, JSON.stringify(this.versions, null, 4));
        }    
    }

    private updateVersion($package: IPackage)
    {
        let [major, minor, revision] = $package.version.split(".").map(x => Number.parseInt(x));

        revision++;

        $package.version = [major, minor, revision].join(".");
    }

    public static async publish(): Promise<void>
    {
        await new Publisher().publish();
    }
}