/* eslint-disable @typescript-eslint/no-require-imports */
import path                            from "path";
import { lookupFile, removePathAsync } from "@surface/io";
import { Stats }                       from "webpack";
import Compiler                        from "./compiler";
import EnviromentType                  from "./enums/enviroment-type";
import IConfiguration                  from "./interfaces/configuration";

type CliBuildOptions =
{
    context?:       string,
    entry?:         string,
    filename?:      string,
    forceTs?:       boolean | string[],
    htmlTemplate?:  string,
    logLevel?:      Stats.ToStringOptions,
    mode?:          EnviromentType,
    output?:        string,
    project?:       string,
    publicPath?:    string,
    tsconfig?:      string,
    eslintrc?:      string,
    watch?:         boolean,
    webpackConfig?: string,
};

const DEFAULTS: Required<Pick<IConfiguration, "context" | "entry" | "filename" | "output" | "publicPath">> =
{
    context:    ".",
    entry:      "./source/index.ts",
    filename:   "[name].js",
    output:     "./build",
    publicPath: "/",
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

    private static resolveConfiguration(options: CliBuildOptions): IConfiguration
    {
        const configuration: IConfiguration = Tasks.createProxy
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
            webpackConfig: options.webpackConfig && require(options.webpackConfig),
        });

        const project = options.project ?? ".";

        const mode = options.mode ?? EnviromentType.Development;

        const lookups =
        [
            project,
            path.join(project, `surface.config.${mode}.js`),
            path.join(project, `surface.config.${mode}.json`),
            path.join(project, "surface.config.js"),
            path.join(project, "surface.config.json"),
        ];

        const projectPath = lookupFile(lookups);

        if (projectPath)
        {
            const projectConfiguration = { ...DEFAULTS, ...require(projectPath) } as IConfiguration;

            const root = path.parse(projectPath).dir;

            Tasks.resolvePaths(projectConfiguration, root);

            return { ...projectConfiguration, ...configuration };
        }

        return configuration;
    }

    private static resolvePath<T extends object, TKey extends keyof T>(configuration: T, key: TKey, context: string): void
    {
        const value = configuration[key];

        if (typeof value == "string")
        {
            configuration[key] = path.resolve(context, value) as unknown as T[TKey];
        }
    }

    private static resolvePaths(configuration: IConfiguration, root: string): void
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

    public static build(options: CliBuildOptions): void
    {
        const configuration = Tasks.resolveConfiguration(options);

        console.log(configuration);

        new Compiler(configuration, options.mode, options.watch)
            .build();
    }

    public static async clean(options: CliBuildOptions): Promise<void>
    {
        const configuration = Tasks.resolveConfiguration(options);

        const promises =
        [
            removePathAsync(configuration.output ?? DEFAULTS.output),
            removePathAsync(path.resolve(__dirname, ".cache")),
        ];

        await Promise.all(promises);
    }
}