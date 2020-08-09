/* eslint-disable @typescript-eslint/no-require-imports */
import fs                 from "fs";
import path               from "path";
import { lookupFile }     from "@surface/io";
import { Stats }          from "webpack";
import Compiler           from "./compiler";
import EnviromentType     from "./enums/enviroment-type";
import IConfiguration     from "./interfaces/configuration";

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
    tslint?:        string,
    watch?:         boolean,
    webpackConfig?: string,
};

const DEFAULTS: IConfiguration =
{
    context:    ".",
    entry:      "./source/index.ts",
    filename:   "[name].js",
    output:     "./build",
    publicPath: "/",
    tsconfig:   "./tsconfig.json",
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
            tslint:        options.tslint,
            webpackConfig: options.webpackConfig,
        });

        const project = options.project ?? ".";

        const projectPath = lookupFile(process.cwd(), [project, path.join(project, `surface.config.${options.mode}.json`), path.join(project, "surface.config.json")]);

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
        if (!configuration.tslint && fs.existsSync(path.resolve(root, "./tslint.json")))
        {
            configuration.tslint = "./tslint.json";
        }

        Tasks.resolvePath(configuration, "context",      root);
        Tasks.resolvePath(configuration, "htmlTemplate", root);
        Tasks.resolvePath(configuration, "output",       root);
        Tasks.resolvePath(configuration, "tsconfig",     root);
        Tasks.resolvePath(configuration, "tslint",       root);

        if (Array.isArray(configuration.forceTs))
        {
            configuration.forceTs.forEach((_, i, e) => Tasks.resolvePath(e, i, root));
        }
    }

    public static build(options: CliBuildOptions): void
    {
        new Compiler(Tasks.resolveConfiguration(options), options.mode, options.watch)
            .build();
    }

    public static async clean(options: { output?: string, project?: string }): Promise<void>
    {
        await new Compiler(Tasks.resolveConfiguration(options))
            .clean();
    }
}