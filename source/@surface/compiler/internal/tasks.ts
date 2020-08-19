/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import path                            from "path";
import { lookupFile, removePathAsync } from "@surface/io";
import webpack                         from "webpack";
import Compiler                        from "./compiler";
import AnalyzerOptions                 from "./types/analyzer-options";
import BuildOptions                    from "./types/build-options";
import Configuration                   from "./types/configuration";
import DevServerOptions                from "./types/dev-serve-options";
import Options                         from "./types/options";

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
    private static createProxy<T extends object>(target: T): T
    {
        const handler: ProxyHandler<T> =
        {
            ownKeys: target => Object.entries(target).filter(x => !Object.is(x[1], undefined)).map(x => x[0]),
        };

        return new Proxy(target, handler);
    }

    private static optionsToConfiguration(options: Options): Configuration
    {
        const configuration: Configuration = Tasks.createProxy
        ({
            context:       options.context,
            entry:         options.entry,
            filename:      options.filename,
            forceTs:       options.forceTs,
            htmlTemplate:  options.htmlTemplate,
            logLevel:      options.logLevel,
            output:        options.output,
            publicPath:    options.publicPath,
            tsconfig:      options.tsconfig,
            tslint:        options.eslintrc,
            webpackConfig: (options.webpackConfig && Tasks.resolveModule(require(options.webpackConfig))) as webpack.Configuration | undefined,
        });

        const project = options.project ?? ".";

        const mode = options.mode ?? "development";

        const lookups =
        [
            project,
            path.join(project, `surface.${mode}.js`),
            path.join(project, `surface.${mode}.json`),
            path.join(project, "surface.js"),
            path.join(project, "surface.json"),
        ];

        const projectPath = lookupFile(lookups);

        if (projectPath)
        {
            const projectConfiguration = { ...DEFAULTS, ...Tasks.resolveModule(require(projectPath)) } as Configuration;

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

    public static analyze(options: Options & AnalyzerOptions): void
    {
        const configuration = Tasks.optionsToConfiguration(options);

        Compiler.analyze(options, configuration);
    }

    public static build(options: Options & BuildOptions): void
    {
        const configuration = Tasks.optionsToConfiguration(options);

        Compiler.build(options, configuration);
    }

    public static async clean(options: Options): Promise<void>
    {
        const configuration = Tasks.optionsToConfiguration(options);

        const promises =
        [
            removePathAsync(configuration.output!),
            removePathAsync(path.resolve(__dirname, ".cache")),
        ];

        await Promise.all(promises);
    }

    public static serve(options: Options & DevServerOptions): void
    {
        const configuration = Tasks.optionsToConfiguration(options);

        Compiler.serve(options, configuration);
    }
}