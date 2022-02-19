import path                                 from "path";
import { DeepMergeFlags, deepMerge, isEsm } from "@surface/core";
import { isDirectory, lookupFile }          from "@surface/io";
import Builder                              from "./builder.js";
import { loadModule }                       from "./common.js";
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
            context:      options.context,
            entry:        options.entry,
            eslint:
            {
                configFile: options.eslintConfigFile,
                enabled:    options.eslintEnabled,
                files:      options.eslintFiles,
                formatter:  options.eslintFormatter,
            },
            filename:     options.filename,
            includeFiles: options.includeFiles,
            index:        options.index,
            mode:         options.mode,
            output:       options.output,
            preferTs:     options.preferTs,
            publicPath:   options.publicPath,
            target:       options.target,
            tsconfig:     options.tsconfig,
        };

        const cliConfiguration: Configuration =
        {
            devServer:
            {
                compress:   options.devserverCompress,
                host:       options.devserverHost,
                hot:        options.devserverHot,
                liveReload: options.devserverLiveReload,
                open:       options.devserverOpen,
                port:       options.devserverPort,
            },
            logging:  options.logging,
            main:     options.main,
            projects: { },
        };

        const cwd        = process.cwd();
        const config     = path.resolve(cwd, options.config ?? ".");
        const configPath = isDirectory(config)
            ? lookupFile([path.join(config, "surface.builder.js"), path.join(config, "surface.builder.json")])
            : config;

        Commands.resolvePaths(cwd, cliProject);

        if (configPath)
        {
            const root                = path.dirname(configPath);
            const loadedConfiguration = Commands.resolveModule(await loadModule(configPath)) as Configuration;

            Object.assign(loadedConfiguration, deepMerge([loadedConfiguration, cliConfiguration], DeepMergeFlags.IgnoreUndefined));

            const isJson = configPath.endsWith(".json");

            for (const [name, project] of Object.entries(loadedConfiguration.projects!))
            {
                const source = !options.project || name == options.project
                    ? [project, cliProject]
                    : [project];

                Object.assign(project, deepMerge(source, DeepMergeFlags.IgnoreUndefined));

                if (isJson)
                {
                    Commands.resolvePaths(root, project);
                }
            }

            return deepMerge([loadedConfiguration, cliConfiguration], DeepMergeFlags.IgnoreUndefined);
        }

        cliConfiguration.projects![options.project ?? "default"] = deepMerge([cliProject], DeepMergeFlags.IgnoreUndefined);

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

    private static resolvePath<T extends object, TKey extends keyof T, TValue extends T[TKey] & string>(cwd: string, configuration: T, key: TKey): void
    {
        const value = configuration[key];

        if (typeof value == "string" && !path.isAbsolute(value))
        {
            configuration[key] = path.resolve(cwd, value) as TValue;
        }
    }

    private static resolveBuildConfigurationPaths(cwd: string, configuration: BuildConfiguration): void
    {
        if (typeof configuration.cache == "object" && configuration.cache.type == "filesystem")
        {
            Commands.resolvePath(cwd, configuration.cache, "cacheDirectory");
        }

        if (configuration.overrides)
        {
            configuration.overrides.forEach(x => (Commands.resolvePath(cwd, x, "replace"), Commands.resolvePath(cwd, x, "with")));
        }
    }

    private static resolvePaths(cwd: string, project: Project): void
    {
        if (project.eslint)
        {
            Commands.resolvePath(cwd, project.eslint, "configFile");
        }

        if (project.environments?.development)
        {
            Commands.resolveBuildConfigurationPaths(cwd, project.environments.development);
        }

        if (project.environments?.production)
        {
            Commands.resolveBuildConfigurationPaths(cwd, project.environments.production);
        }

        Commands.resolvePath(cwd, project, "context");
        Commands.resolvePath(cwd, project, "index");
        Commands.resolvePath(cwd, project, "output");
        Commands.resolvePath(cwd, project, "tsconfig");

        if (Array.isArray(project.preferTs))
        {
            project.preferTs.forEach((_, i) => Commands.resolvePath(cwd, project.preferTs as string[], i));
        }
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