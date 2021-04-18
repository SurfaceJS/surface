import path                                                 from "path";
import { isEsm }                                            from "@surface/core";
import { isFile, lookupFile, removePathAsync }              from "@surface/io";
import type webpack                                         from "webpack";
import type { BundleAnalyzerPlugin }                        from "webpack-bundle-analyzer";
import Builder                                              from "./builder.js";
import { createOnlyDefinedProxy, createStats, loadModule }  from "./common.js";
import type CliAnalyzerOptions                              from "./types/cli-analyzer-options";
import type CliBuildOptions                                 from "./types/cli-build-options";
import type CliDevServerOptions                             from "./types/cli-dev-serve-options";
import type CliOptions                                      from "./types/cli-options";
import type Configuration                                   from "./types/configuration";
import type Project                                         from "./types/project";
import type WebpackExtension                                from "./types/webpack-extension";

export default class Tasks
{
    private static createDefaults(): Required<Pick<Project, "context" | "entry" | "filename" | "publicPath" | "output" | "tsconfig">>
    {
        return {
            context:    ".",
            entry:      "./source/index.ts",
            filename:   "[name].js",
            output:     "./build",
            publicPath: "/",
            tsconfig:   "./tsconfig.json",
        };
    }

    private static setDefaults<T>(target: T, source: T): void
    {
        for (const [key, value] of Object.entries(source) as [keyof T, T[keyof T]][])
        {
            if (Object.is(target[key], undefined) && !Object.is(value, undefined))
            {
                target[key] = value;
            }
        }
    }

    private static override<T>(target: T, source: T): void
    {
        for (const [key, value] of Object.entries(source) as [keyof T, T[keyof T]][])
        {
            if (!Object.is(value, undefined))
            {
                target[key] = value;
            }
        }
    }

    private static async optionsToConfiguration(options: CliOptions): Promise<Project>
    {
        const cwd = process.cwd();

        const project = !options.project
            ? cwd
            : path.isAbsolute(options.project)
                ? options.project
                : path.resolve(cwd, options.project);

        const cliProject: Project = createOnlyDefinedProxy
        ({
            context:       options.context,
            copyFiles:     options.includeFiles,
            entry:         options.entry,
            eslintrc:      options.eslintrc,
            filename:      options.filename,
            forceTs:       options.preferTs,
            htmlTemplate:  options.htmlTemplate,
            logging:       options.logging,
            mode:          options.mode,
            output:        options.output,
            publicPath:    options.publicPath,
            tsconfig:      options.tsconfig,
            useWorkbox:    options.useWorkbox,
            webpack:       options.webpackConfiguration || options.webpackPostConfiguration
                ? createOnlyDefinedProxy({
                    configuration:     options.webpackConfiguration     ? Tasks.resolveModule(await loadModule(options.webpackConfiguration)) : undefined,
                    postConfiguration: options.webpackPostConfiguration ? Tasks.resolveModule(await loadModule(options.webpackPostConfiguration)) : undefined,
                }) as WebpackExtension : undefined,
        });

        Tasks.resolvePaths(cliProject, cwd);

        const projectPath = isFile(project)
            ? project
            : lookupFile
            ([
                path.join(project, `surface.${options.mode ?? "development"}.js`),
                path.join(project, `surface.${options.mode ?? "development"}.json`),
                path.join(project, "surface.js"),
                path.join(project, "surface.json"),
            ]);

        const defaults = Tasks.createDefaults();

        if (projectPath)
        {
            Tasks.resolvePaths(defaults, path.dirname(projectPath));

            const loadedProject = Tasks.resolveModule(await loadModule(projectPath)) as Project;

            const isJson = projectPath.endsWith(".json");

            if (isJson)
            {
                Tasks.resolvePaths(loadedProject, path.dirname(projectPath));
            }

            const project = { ...defaults, ...loadedProject, ...cliProject, webpack: { ...loadedProject.webpack, ...cliProject.webpack } };

            if (project.dependencies)
            {
                for (const dependency of project.dependencies)
                {
                    if (isJson)
                    {
                        Tasks.resolvePaths(dependency, path.dirname(projectPath));

                        if (typeof dependency.webpack?.configuration == "string")
                        {
                            dependency.webpack.configuration = (Tasks.resolveModule(await loadModule(dependency.webpack.configuration))) as WebpackExtension["configuration"];
                        }

                        if (typeof dependency.webpack?.postConfiguration == "string")
                        {
                            dependency.webpack.postConfiguration = (Tasks.resolveModule(await loadModule(dependency.webpack.postConfiguration))) as WebpackExtension["postConfiguration"];
                        }
                    }

                    const defaults =
                    {
                        context:    project.context,
                        eslintrc:   project.eslintrc,
                        filename:   project.filename,
                        output:     project.output,
                        preferTs:   project.preferTs,
                        publicPath: project.publicPath,
                        tsconfig:   project.tsconfig,
                    };

                    Tasks.setDefaults(dependency, defaults as Partial<Configuration>);
                }
            }

            if (typeof project.webpack?.configuration == "string")
            {
                project.webpack.configuration = (Tasks.resolveModule(await loadModule(project.webpack.configuration))) as webpack.Configuration;
            }

            if (typeof project.webpack?.postConfiguration == "string")
            {
                project.webpack.postConfiguration = (Tasks.resolveModule(await loadModule(project.webpack.postConfiguration))) as WebpackExtension["postConfiguration"];
            }

            return project;
        }

        Tasks.resolvePaths(defaults, cwd);

        return { ...defaults, ...cliProject };
    }

    private static resolveModule(module: unknown): unknown
    {
        if (isEsm(module) && Reflect.has(module, "default"))
        {
            return Reflect.get(module, "default");
        }

        return module;
    }

    private static resolvePath<T extends object, TKey extends keyof T>(configuration: T, key: TKey, context: string): void
    {
        const value = configuration[key];

        if (typeof value == "string" && !path.isAbsolute(value))
        {
            configuration[key] = path.resolve(context, value) as unknown as T[TKey];
        }
    }

    private static resolvePaths(project: Project, root: string): void
    {
        if (!project.eslintrc)
        {
            const lookups =
            [
                path.resolve(root, ".eslintrc.js"),
                path.resolve(root, ".eslintrc.json"),
                path.resolve(root, ".eslintrc.yml"),
                path.resolve(root, ".eslintrc.yaml"),
            ];

            const eslintrcPath = lookupFile(lookups);

            if (eslintrcPath)
            {
                project.eslintrc = eslintrcPath;
            }
        }
        else
        {
            Tasks.resolvePath(project, "eslintrc", root);
        }

        Tasks.resolvePath(project, "context",       root);
        Tasks.resolvePath(project, "htmlTemplate",  root);
        Tasks.resolvePath(project, "output",        root);
        Tasks.resolvePath(project, "tsconfig",      root);

        if (project.webpack)
        {
            Tasks.resolvePath(project.webpack, "configuration", root);
            Tasks.resolvePath(project.webpack, "postConfiguration", root);
        }

        if (Array.isArray(project.preferTs))
        {
            project.preferTs.forEach((_, index, source) => Tasks.resolvePath(source, index, root));
        }
    }

    public static async analyze(options: CliOptions & CliAnalyzerOptions): Promise<void>
    {
        const configuration = await Tasks.optionsToConfiguration(options);

        const logging = !configuration.logging
            ? "none"
            : configuration.logging == true
                ? "info"
                : configuration.logging;

        const logLevel: BundleAnalyzerPlugin.Options["logLevel"] =
            logging == "none"
                ? "silent"
                : logging == "verbose" || logging == "log"
                    ? "info"
                    :  logging;

        const cliAnalyzerOptions: Project["bundlerAnalyzer"] =
        {
            analyzerHost:   options.analyzerHost,
            analyzerMode:   options.analyzerMode ?? "static",
            analyzerPort:   options.analyzerPort,
            defaultSizes:   options.defaultSizes,
            excludeAssets:  options.excludeAssets,
            logLevel,
            openAnalyzer:   options.openAnalyzer,
            reportFilename: options.reportFilename,
        };

        Tasks.override(configuration.bundlerAnalyzer ??= { }, cliAnalyzerOptions);

        await removePathAsync(configuration.output!);

        await Builder.analyze(configuration);
    }

    public static async build(options: CliOptions & CliBuildOptions): Promise<void>
    {
        const configuration = await Tasks.optionsToConfiguration(options);

        await removePathAsync(configuration.output!);

        options.watch
            ? await Builder.watch(configuration)
            : await Builder.run(configuration);
    }

    public static async serve(options: CliOptions & CliDevServerOptions): Promise<void>
    {
        const configuration = await Tasks.optionsToConfiguration(options);

        const cliDevServerOptions: Project["devServer"] =
        {
            compress:              options.compress,
            contentBase:           options.contentBase,
            contentBasePublicPath: options.contentBasePublicPath,
            host:                  options.host,
            hot:                   options.hot,
            hotOnly:               options.hotOnly,
            index:                 options.index,
            lazy:                  options.lazy,
            liveReload:            options.liveReload,
            open:                  options.open,
            openPage:              options.openPage,
            port:                  options.port,
            public:                options.public,
            quiet:                 options.quiet,
            stats:                 createStats(configuration.logging),
            useLocalIp:            options.useLocalIp,
            watchContentBase:      options.watchContentBase,
            writeToDisk:           options.writeToDisk,
        };

        Tasks.override(configuration.devServer ??= { }, cliDevServerOptions);

        await removePathAsync(configuration.output!);

        await Builder.serve(configuration);
    }
}