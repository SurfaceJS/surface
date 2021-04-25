import path                                 from "path";
import { DeepMergeFlags, deepMerge, isEsm } from "@surface/core";
import { isFile, lookupFile }               from "@surface/io";
import Builder                              from "./builder.js";
import { createStats, loadModule }          from "./common.js";
import type BuildConfiguration              from "./types/build-configuration.js";
import type CliAnalyzerOptions              from "./types/cli-analyzer-options";
import type CliBuildOptions                 from "./types/cli-build-options";
import type CliDevServerOptions             from "./types/cli-dev-serve-options";
import type CliOptions                      from "./types/cli-options";
import type Configuration                   from "./types/configuration.js";
import type Project                         from "./types/project";

export default class Commands
{
    private static async optionsToConfiguration(options: CliOptions & CliAnalyzerOptions & CliDevServerOptions): Promise<Configuration>
    {
        const cwd = process.cwd();

        const config = !options.config
            ? cwd
            : path.isAbsolute(options.config)
                ? options.config
                : path.resolve(cwd, options.config);

        const cliProject: Project =
        {
            analyzer:
            {
                analyzerHost:   options.analyzerHost,
                analyzerMode:   options.analyzerMode,
                analyzerPort:   options.analyzerPort,
                defaultSizes:   options.analyzerDefaultSizes,
                excludeAssets:  options.analyzerExcludeAssets,
                logLevel:       options.analyzerLogLevel,
                openAnalyzer:   options.analyzerOpen,
                reportFilename: options.analyzerReportFilename,
            },
            context: options.context,
            entry:   options.entry,
            eslint:
            {
                enabled:  options.eslintrc ? true : undefined,
                eslintrc: options.eslintrc,
            },
            filename:      options.filename,
            includeFiles:  options.includeFiles,
            index:         options.index,
            mode:          options.mode,
            output:        options.output,
            preferTs:      options.preferTs,
            publicPath:    options.publicPath,
            target:        options.target,
            tsconfig:      options.tsconfig,
        };

        const cliConfiguration: Configuration =
        {
            devServer:
            {
                compress:              options.devserverCompress,
                contentBase:           options.devserverContentBase,
                contentBasePublicPath: options.devserverContentBasePublicPath,
                host:                  options.devserverHost,
                hot:                   options.devserverHot,
                hotOnly:               options.devserverHotOnly,
                index:                 options.devserverIndex,
                lazy:                  options.devserverLazy,
                liveReload:            options.devserverLiveReload,
                open:                  options.devserverOpen,
                openPage:              options.devserverOpenPage,
                port:                  options.devserverPort,
                public:                options.devserverPublic,
                quiet:                 options.devserverQuiet,
                stats:                 options.logging ? createStats(options.logging) : undefined,
                useLocalIp:            options.devserverUseLocalIp,
                watchContentBase:      options.devserverWatchContentBase,
                writeToDisk:           options.devserverWriteToDisk,
            },
            logging:  options.logging,
            main:     options.main,
            projects: { },
        };

        Commands.resolvePaths(cliProject, cwd);

        const configPath = isFile(config)
            ? config
            : lookupFile([path.join(config, "surface.js"), path.join(config, "surface.json")]);

        if (configPath)
        {
            const loadedConfiguration = Commands.resolveModule(await loadModule(configPath)) as Configuration;

            Object.assign(loadedConfiguration, deepMerge([loadedConfiguration, cliConfiguration], DeepMergeFlags.IgnoreUndefined));

            const isJson = configPath.endsWith(".json");

            if (isJson)
            {
                for (const [name, project] of Object.entries(loadedConfiguration.projects!))
                {
                    if (!options.project || name == options.project)
                    {
                        Object.assign(project, deepMerge([project, cliProject], DeepMergeFlags.IgnoreUndefined));
                    }

                    Commands.resolvePaths(project, path.dirname(configPath));
                }
            }

            return deepMerge([loadedConfiguration, cliConfiguration], DeepMergeFlags.IgnoreUndefined);
        }

        cliConfiguration.projects![options.project ?? "default"] = cliProject;

        return deepMerge([cliConfiguration], DeepMergeFlags.IgnoreUndefined);
    }

    private static resolveModule(module: unknown): unknown
    {
        if (isEsm(module) && Reflect.has(module, "default"))
        {
            return Reflect.get(module, "default");
        }

        return module;
    }

    private static resolvePath<T extends object, TKey extends keyof T, TValue extends T[TKey] & string>(configuration: T, key: TKey, context: string): void
    {
        const value = configuration[key];

        if (typeof value == "string" && !path.isAbsolute(value))
        {
            configuration[key] = path.resolve(context, value) as TValue;
        }
    }

    private static resolveCachPath(configuration: BuildConfiguration, root: string): void
    {
        if (typeof configuration.cache == "object" && configuration.cache.type == "filesystem")
        {
            Commands.resolvePath(configuration.cache, "cacheDirectory",  root);
        }
    }

    private static resolvePaths(project: Project, root: string): void
    {
        if (project.eslint)
        {
            Commands.resolvePath(project.eslint, "eslintrc", root);
        }

        if (project.configurations?.development)
        {
            Commands.resolveCachPath(project.configurations.development, root);
        }

        if (project.configurations?.production)
        {
            Commands.resolveCachPath(project.configurations.production, root);
        }

        Commands.resolvePath(project, "context",  root);
        Commands.resolvePath(project, "index",    root);
        Commands.resolvePath(project, "output",   root);
        Commands.resolvePath(project, "tsconfig", root);
    }

    public static async analyze(options: CliOptions & CliAnalyzerOptions): Promise<void>
    {
        const configuration = await Commands.optionsToConfiguration(options);

        await Builder.analyze(configuration);
    }

    public static async build(options: CliOptions & CliBuildOptions): Promise<void>
    {
        const configuration = await Commands.optionsToConfiguration(options);

        options.watch
            ? await Builder.watch(configuration)
            : await Builder.run(configuration);
    }

    public static async serve(options: CliOptions & CliDevServerOptions): Promise<void>
    {
        const configuration = await Commands.optionsToConfiguration(options);

        await Builder.serve(configuration);
    }
}