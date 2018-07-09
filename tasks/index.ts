import fs          from "fs";
import path        from "path";
import * as common from "./common";
import packages    from "./common/packages";
import patterns    from "./common/patterns";
import Publisher   from "./internal/publisher";

const paths =
{
    modules:
    {
        root:    path.resolve(__dirname, "../"),
        source:  path.resolve(__dirname, "../source"),
        package: path.resolve(__dirname, "../package.json"),
    }
};

export default class Tasks
{
    public static async build(): Promise<void>
    {
        const commands: Array<Promise<void>> = [];

        for (const $packages of packages)
        {
            const source = path.normalize(path.resolve(paths.modules.source, $packages.name));

            commands.push(common.execute(`Building ${$packages.name}`, `tsc -p ${source}`));
        }

        await Promise.all(commands);

        console.log("Building done!");
    }

    public static clean(): void
    {
        for (const $packages of packages)
        {
            const source = path.normalize(path.resolve(paths.modules.source, $packages.name));

            console.log(`Cleaning ${$packages.name}`);
            common.cleanup(source, patterns.clean.include, patterns.clean.exclude);
        }

        console.log("Cleaning done!");
    }

    public static async cover(filepath: string): Promise<void>
    {
        const file = path.parse(filepath);

        let alias = file.name.replace(".spec", "");

        if (alias == path.parse(path.resolve(file.dir, "../")).base)
        {
            alias = "index";
        }

        await common.execute(`cover ${file.name} tests`, `nyc --include ./**/${alias}.js --exclude tests/* --reporter=text mocha --ui tdd ${file.name}.js`);
    }

    public static async install(full: "true"|"false"): Promise<void>
    {
        Tasks.unlink();

        const commands: Array<Promise<void>> = [];

        for (const $package of packages)
        {
            const dependencies = { ...$package.dependencies, ...$package.devDependencies };

            const targets = Object.keys(dependencies)
                .filter(x => !x.startsWith("@surface/") || full == "true")
                .map(key => `${key}@${dependencies[key].replace(/^(\^|\~)/, "")}`)
                .join(" ");

            if (targets)
            {
                commands.push(common.execute(`Installing ${$package.name} dependencies.`, `cd ${$package.path} && npm install ${targets} --save-exact`));
            }
        }

        await Promise.all(commands);

        Tasks.link();

        console.log("Compiling done!");
    }

    public static async publish(): Promise<void>
    {
        await Publisher.publish();
    }

    public static link(): void
    {
        for (const $package of packages)
        {
            for (const key of Object.keys({ ...$package.dependencies, ...$package.devDependencies }).filter(x => x.startsWith("@surface/")))
            {
                const original    = path.normalize(path.resolve(paths.modules.source, key));
                const nodeModules = path.normalize(path.join(paths.modules.source, $package.name, "node_modules"));
                const symlink     = path.normalize(path.join(nodeModules, key));

                common.makePath(path.join(nodeModules, "@surface"));

                if (!fs.existsSync(symlink))
                {
                    //console.log(`Linking ${$package.name} dependence[${key}]`);
                    //fs.symlinkSync(original, symlink);
                    common.execute(`Linking ${$package.name} dependence[${key}]`, `mklink /J ${symlink} ${original}`);
                }
            }
        }

        console.log("Linking done!");
    }

    public static unlink(): void
    {
        for (const $package of packages)
        {
            const targetFolder = path.normalize(path.join(paths.modules.source, $package.name, "node_modules", "@surface"));

            if (fs.existsSync(targetFolder))
            {
                console.log(`Unlinking @surface on ${$package.name}`);
                common.deletePath(targetFolder);
            }
        }

        console.log("Unlinking done!");
    }

    public static relink(): void
    {
        Tasks.unlink();
        Tasks.link();
    }

    public static async setup(): Promise<void>
    {
        await Tasks.install("false");
        Tasks.clean();
        await Tasks.build();
    }
}