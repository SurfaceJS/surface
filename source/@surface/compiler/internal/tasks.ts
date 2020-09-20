/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import path                                        from "path";
import webpack                                     from "webpack";
import { removeUndefined }                         from "./common";
import Compiler                                    from "./compiler";
import { loadModule, lookupFile, removePathAsync } from "./external";
import AnalyzerOptions                             from "./types/analyzer-options";
import BuildOptions                                from "./types/build-options";
import Configuration                               from "./types/configuration";
import DevServerOptions                            from "./types/dev-serve-options";
import Options                                     from "./types/options";

const DEFAULTS: Required<Pick<Configuration, "context" | "entry" | "filename" | "output" | "tsconfig">> =
{
    context:  ".",
    entry:    "./source/index.ts",
    filename: "[name].js",
    output:   "./build",
    tsconfig: "./tsconfig.json",
};

export default class Tasks
{
    private static async optionsToConfiguration(options: Options & { mode?: webpack.Configuration["mode"] }): Promise<Configuration>
    {
        const configuration: Configuration = removeUndefined
        ({
            context:       options.context,
            entry:         options.entry,
            eslintrc:      options.eslintrc,
            filename:      options.filename,
            forceTs:       options.forceTs,
            htmlTemplate:  options.htmlTemplate,
            logLevel:      options.logLevel,
            output:        options.output,
            publicPath:    options.publicPath,
            tsconfig:      options.tsconfig,
            webpackConfig: (options.webpackConfig && Tasks.resolveModule(await loadModule(options.webpackConfig))) as webpack.Configuration | undefined,
        });

        const project = options.project ?? ".";

        const lookups =
        [
            project,
            path.join(project, `surface.${options.mode}.js`),
            path.join(project, `surface.${options.mode}.json`),
            path.join(project, "surface.js"),
            path.join(project, "surface.json"),
        ];

        const projectPath = lookupFile(lookups);

        if (projectPath)
        {
            const projectConfiguration = { ...DEFAULTS, ...Tasks.resolveModule(await loadModule(projectPath)) } as Configuration;

            const root = path.parse(projectPath).dir;

            Tasks.resolvePaths(projectConfiguration, root);

            return { ...projectConfiguration, ...configuration };
        }

        return configuration;
    }

    private static resolveModule(module: object | { default: object }): object
    {
        if ("default" in module)
        {
            return module.default;
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
                ".eslintrc.js",
                ".eslintrc.json",
                ".eslintrc.yml",
                ".eslintrc.yaml",
            ];

            const eslintrcPath = lookupFile(lookups);

            if (eslintrcPath)
            {
                configuration.eslintrc = eslintrcPath;
            }
        }

        Tasks.resolvePath(configuration, "context",      root);
        Tasks.resolvePath(configuration, "htmlTemplate", root);
        Tasks.resolvePath(configuration, "output",       root);
        Tasks.resolvePath(configuration, "tsconfig",     root);
        Tasks.resolvePath(configuration, "eslintrc",     root);

        if (Array.isArray(configuration.forceTs))
        {
            configuration.forceTs.forEach((_, i, e) => Tasks.resolvePath(e, i, root));
        }
    }

    public static async analyze(options: Options & AnalyzerOptions): Promise<void>
    {
        const configuration = await Tasks.optionsToConfiguration(options);

        const analyzerOptions: AnalyzerOptions = removeUndefined
        ({
            analyzerMode:   options.analyzerMode,
            defaultSizes:   options.defaultSizes,
            exclude:        options.exclude,
            host:           options.host,
            logLevel:       options.logLevel,
            mode:           options.mode,
            open:           options.open,
            port:           options.port,
            reportFilename: options.reportFilename,
        });

        await Compiler.analyze(configuration, analyzerOptions);
    }

    public static async build(options: Options & BuildOptions): Promise<void>
    {
        const configuration = await Tasks.optionsToConfiguration(options);

        const buildOptions: BuildOptions = removeUndefined
        ({
            hot:      options.hot,
            logLevel: options.logLevel,
            mode:     options.mode,
            watch:    options.watch,
        });

        options.watch
            ? await Compiler.watch(configuration, buildOptions)
            : await Compiler.run(configuration, buildOptions);
    }

    public static async clean(options: Pick<Options, "project">): Promise<void>
    {
        const configuration = await Tasks.optionsToConfiguration(options);

        const promises =
        [
            removePathAsync(configuration.output!),
            removePathAsync(path.resolve(__dirname, ".cache")),
        ];

        await Promise.all(promises);
    }

    public static async serve(options: Options & DevServerOptions): Promise<void>
    {
        const configuration = await Tasks.optionsToConfiguration(options);

        const devServerOptions: DevServerOptions = removeUndefined
        ({
            host:     options.host,
            hot:      options.hot,
            logLevel: options.logLevel,
            port:     options.port,
        });

        await Compiler.serve(configuration, devServerOptions);
    }
}