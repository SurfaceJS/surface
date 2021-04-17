import path                                                 from "path";
import { deepMerge, isEsm }                                 from "@surface/core";
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
import type WebpackExtension                                from "./types/webpack-extension.js";

export default class Tasks
{
    private static createDefaults(): Required<Pick<Configuration, "context" | "entry" | "filename" | "publicPath" | "output" | "tsconfig">>
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

    private static async optionsToConfiguration(options: CliOptions): Promise<Configuration>
    {
        const cwd = process.cwd();

        const project = !options.project
            ? cwd
            : path.isAbsolute(options.project)
                ? options.project
                : path.resolve(cwd, options.project);

        const cliConfiguration: Configuration = createOnlyDefinedProxy
        ({
            context:       options.context,
            copyFiles:     options.copyFiles,
            entry:         options.entry,
            eslintrc:      options.eslintrc,
            filename:      options.filename,
            forceTs:       options.forceTs,
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

        Tasks.resolvePaths(cliConfiguration, cwd);

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

            const projectConfiguration = Tasks.resolveModule(await loadModule(projectPath)) as Configuration;

            const isJson = projectPath.endsWith(".json");

            if (isJson)
            {
                Tasks.resolvePaths(projectConfiguration, path.dirname(projectPath));
            }

            const configuration = { ...defaults, ...projectConfiguration, ...cliConfiguration, webpack: { ...projectConfiguration.webpack, ...cliConfiguration.webpack } };

            if (configuration.compilations)
            {
                for (const compilation of configuration.compilations)
                {
                    Object.assign(compilation, deepMerge(configuration, compilation), { compilations: undefined } as Configuration);

                    if (isJson)
                    {
                        Tasks.resolvePaths(compilation, path.dirname(projectPath));

                        if (typeof compilation.webpack?.configuration == "string")
                        {
                            compilation.webpack.configuration = (Tasks.resolveModule(await loadModule(compilation.webpack.configuration))) as WebpackExtension["configuration"];
                        }

                        if (typeof compilation.webpack?.postConfiguration == "string")
                        {
                            compilation.webpack.postConfiguration = (Tasks.resolveModule(await loadModule(compilation.webpack.postConfiguration))) as WebpackExtension["postConfiguration"];
                        }
                    }
                }
            }

            if (typeof configuration.webpack?.configuration == "string")
            {
                configuration.webpack.configuration = (Tasks.resolveModule(await loadModule(configuration.webpack.configuration))) as webpack.Configuration;
            }

            if (typeof configuration.webpack?.postConfiguration == "string")
            {
                configuration.webpack.postConfiguration = (Tasks.resolveModule(await loadModule(configuration.webpack.postConfiguration))) as WebpackExtension["postConfiguration"];
            }

            return configuration;
        }

        Tasks.resolvePaths(defaults, cwd);

        return { ...defaults, ...cliConfiguration };
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

    private static resolvePaths(configuration: Configuration, root: string): void
    {
        if (!configuration.eslintrc)
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
                configuration.eslintrc = eslintrcPath;
            }
        }
        else
        {
            Tasks.resolvePath(configuration, "eslintrc", root);
        }

        Tasks.resolvePath(configuration, "context",       root);
        Tasks.resolvePath(configuration, "htmlTemplate",  root);
        Tasks.resolvePath(configuration, "output",        root);
        Tasks.resolvePath(configuration, "tsconfig",      root);

        if (configuration.webpack)
        {
            Tasks.resolvePath(configuration.webpack, "configuration", root);
            Tasks.resolvePath(configuration.webpack, "postConfiguration", root);
        }

        if (Array.isArray(configuration.forceTs))
        {
            configuration.forceTs.forEach((_, index, source) => Tasks.resolvePath(source, index, root));
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

        configuration.bundlerAnalyzer = createOnlyDefinedProxy
        ({
            analyzerHost:   options.analyzerHost,
            analyzerMode:   options.analyzerMode ?? "static",
            analyzerPort:   options.analyzerPort,
            defaultSizes:   options.defaultSizes,
            excludeAssets:  options.excludeAssets,
            logLevel,
            openAnalyzer:   options.openAnalyzer,
            reportFilename: options.reportFilename,
        });

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

        configuration.devServer = createOnlyDefinedProxy
        ({
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
        });

        await removePathAsync(configuration.output!);

        await Builder.serve(configuration);
    }
}