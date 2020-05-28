import { deepMergeCombine, Indexer } from "@surface/core";
import { resolveFile }               from "@surface/io";
import chalk                         from "chalk";
import ForkTsCheckerWebpackPlugin    from "fork-ts-checker-webpack-plugin";
import fs                            from "fs";
import path                          from "path";
import rimraf                        from "rimraf";
import TerserWebpackPlugin           from "terser-webpack-plugin";
import webpack                       from "webpack";
import { EnviromentType, TasksType } from "./enums";
import IConfiguration                from "./interfaces/configuration";
import { Entry }                     from "./interfaces/types";
import HtmlTemplatePlugin            from "./plugins/html-template-plugin";
import SimblingPriorityPlugin        from "./plugins/simbling-priority-plugin";

const loaders =
{
    cache:
    {
        loader: "cache-loader",
        options:
        {
            cacheDirectory: path.resolve(__dirname, ".cache")
        }
    },
    css: { loader: "css-loader" },
    file:
    {
        loader: "file-loader",
        options: { name: "[hash].[ext]", outputPath: "resources" }
    },
    fileCss:
    {
        loader: "file-loader",
        options: { name: "[hash].css", outputPath: "resources", esModule: false }
    },
    extract: { loader: "extract-loader" },
    html:
    {
        loader: "html-loader",
        options:
        {
            attributes: true,
            esModule:   true,
            minimize:   true
        }
    },
    resolveUrl:
    {
        loader: "resolve-url-loader",
        options:
        {
            removeCR: true
        }
    },
    sass:       { loader: "sass-loader" },
    style:      { loader: "style-loader" },
    thread:
    {
        loader: "thread-loader",
        options:
        {
          // there should be 1 cpu for the fork-ts-checker-webpack-plugin
          workers: require("os").cpus().length - 1,
        },
    },
    toString: { loader: "to-string-loader" },
    ts:
    {
        loader: "ts-loader",
        options:
        {
            configFile:              "tsconfig.json",
            happyPackMode:           true,
            onlyCompileBundledFiles: true,
            transpileOnly:           true
        }
    },
};

export default class Compiler
{
    /**
     * Build Surface project using provided configuration.
     * @param config     Webpack configuration.
     * @param enviroment Enviroment variable.
     * @param watch      Enable watch mode.
     */
    private static async build(config: webpack.Configuration, enviroment: EnviromentType, watch: boolean, statsLevel?: webpack.Stats.Preset): Promise<void>
    {
        const webpackCompiler = webpack(config);

        const statOptions: webpack.Stats.ToStringOptions = statsLevel ??
        {
            assets:   true,
            errors:   true,
            colors:   true,
            version:  true,
            warnings: true
        };

        const callback: webpack.Compiler.Handler =
            (error, stats) => error ? console.log(error.message) : console.log(stats.toString(statOptions));

        console.log(`Starting ${chalk.bold.green(watch ? "Watch" : "build")} using ${chalk.bold.green(enviroment)} configuration.`);

        if (watch)
        {
            webpackCompiler.watch({ aggregateTimeout: 500, poll: true, ignored: /node_modules/ }, callback);
        }
        else
        {
            webpackCompiler.run(callback);
        }
    }

    /**
     * Clean target output
     * @param config Webpack configuration
     */
    private static async clean(config: webpack.Configuration): Promise<void>
    {
        if (config.output && config.output.path)
        {
            const outputPath = config.output.path;

            const promises =
            [
                new Promise(resolve => rimraf(outputPath, resolve)),
                new Promise(resolve => rimraf(path.resolve(__dirname, ".cache"), resolve))
            ];

            await Promise.all(promises);
        }
        else
        {
            throw new Error("Invalid output path.");
        }
    }

    /**
     * Get Webpack config based on Surface config.
     * @param path        Path to Surface config.
     * @param enviroment  Enviroment variable.
     */
    private static getConfig(filepath: string, enviroment: EnviromentType): webpack.Configuration
    {
        filepath = resolveFile(process.cwd(), [filepath, path.join(filepath, `surface.config.${enviroment}.json`), path.join(filepath, "surface.config.json")]);

        const configuration = require(filepath) as IConfiguration;

        const root = path.dirname(filepath);

        if (!configuration.context)
        {
            throw new TypeError("Property \"context\" can\"t be null");
        }

        if (!configuration.entry)
        {
            throw new TypeError("Property \"entry\" can\"t be null");
        }

        if (!configuration.output)
        {
            throw new TypeError("Property \"output\" can\"t be null");
        }

        configuration.context = path.resolve(root, configuration.context);
        configuration.entry   = this.resolveEntries(configuration.context, configuration.entry);
        configuration.output  = path.resolve(root, configuration.output);

        let userWebpack: webpack.Configuration = { };

        if (configuration.webpackConfig)
        {
            if (typeof configuration.webpackConfig == "string" && fs.existsSync(configuration.webpackConfig))
            {
                userWebpack = require(path.resolve(root, configuration.webpackConfig)) as webpack.Configuration;
            }
            else
            {
                userWebpack = configuration.webpackConfig as webpack.Configuration;
            }
        }

        configuration.tsconfig = configuration.tsconfig && (path.resolve(root, configuration.tsconfig) ?? "tsconfig.json");
        configuration.tslint   = configuration.tslint   && path.resolve(root, configuration.tslint);

        const resolvePlugins: Array<webpack.ResolvePlugin> = [];
        const plugins:        Array<webpack.Plugin>        = [];

        if (configuration.simblingResolve)
        {
            if (!Array.isArray(configuration.simblingResolve))
            {
                configuration.simblingResolve = [configuration.simblingResolve];
            }

            for (const option of configuration.simblingResolve)
            {
                if (option.include)
                {
                    option.include = option.include.map(x => path.resolve(root, x));
                }

                if (option.exclude)
                {
                    option.exclude = option.exclude.map(x => path.resolve(root, x));
                }

                resolvePlugins.push(new SimblingPriorityPlugin(option));
            }
        }

        plugins.push(new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/]));
        plugins.push(new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true, tsconfig: configuration.tsconfig, tslint: configuration.tslint, watch: configuration.context }));

        if (configuration.htmlTemplate)
        {
            configuration.htmlTemplate.template = path.resolve(root, configuration.htmlTemplate.template);
            plugins.push(new HtmlTemplatePlugin(configuration.htmlTemplate));
        }

        const isProduction = enviroment == EnviromentType.production;

        const tersePlugin = new TerserWebpackPlugin
        ({
            cache:           true,
            extractComments: true,
            parallel:        true,
            terserOptions:
            {
                compress: true,
                mangle:   true,
            }
        });

        const webpackConfiguration: webpack.Configuration =
        {
            context: configuration.context,
            devtool: isProduction ? false : "#source-map",
            entry:   configuration.entry,
            mode:    enviroment,
            module:
            {
                rules:
                [
                    {
                        test: /\.(png|jpe?g|svg|ttf|woff2?|eot)$/,
                        use:  loaders.file
                    },
                    {
                        test: /\.s?css$/,
                        oneOf:
                        [
                            {
                                resourceQuery: /global/,
                                use:
                                [
                                    loaders.style,
                                    loaders.css,
                                    loaders.resolveUrl,
                                    loaders.sass
                                ]
                            },
                            {
                                resourceQuery: /raw/,
                                use:
                                [
                                    loaders.toString,
                                    loaders.css,
                                    loaders.resolveUrl,
                                    loaders.sass,
                                ]
                            },
                            {
                                resourceQuery: /file/,
                                use:
                                [
                                    loaders.fileCss,
                                    loaders.extract,
                                    loaders.css,
                                    loaders.resolveUrl,
                                    loaders.sass
                                ]
                            },
                            {
                                use:
                                [
                                    loaders.toString,
                                    loaders.css,
                                    loaders.resolveUrl,
                                    loaders.sass,
                                ]
                            },
                        ]
                    },
                    {
                        test: /\.html$/,
                        use:  loaders.html
                    },
                    {
                        test: /\.ts$/,
                        use:
                        [
                            loaders.cache,
                            loaders.thread,
                            loaders.ts
                        ],
                    },
                ]
            },
            optimization:
            {
                concatenateModules:   isProduction,
                flagIncludedChunks:   isProduction,
                mergeDuplicateChunks: isProduction,
                minimize:             isProduction,
                minimizer:            [tersePlugin],
                namedChunks:          !isProduction,
                namedModules:         !isProduction,
                noEmitOnErrors:       true,
                occurrenceOrder:      true,
                providedExports:      true,
                splitChunks:
                {
                    cacheGroups:
                    {
                        common:
                        {
                            minChunks:          2,
                            priority:           -20,
                            reuseExistingChunk: true
                        },
                        vendors:
                        {
                            test:     /[\\/]node_modules[\\/]/,
                            priority: -10
                        }
                    },
                    chunks:             "async",
                    maxAsyncRequests:   5,
                    maxInitialRequests: 3,
                    maxSize:            0,
                    minSize:            30000,
                    minChunks:          1,
                    name:               true,
                },
                usedExports: isProduction
            },
            output:
            {
                //devtoolModuleFilenameTemplate: "webpack://source/[resource-path]?[loaders]",
                filename:                      configuration.filename,
                path:                          configuration.output,
                pathinfo:                      !isProduction,
                publicPath:                    "/",
            },
            plugins: plugins,
            performance:
            {
                hints: isProduction ? "warning" : false
            },
            resolve:
            {
                alias:      { tslib: path.resolve(__dirname, "../node_modules", "tslib") },
                extensions: [".ts", ".js"],
                modules:    [".", "node_modules", configuration.context],
                plugins:    resolvePlugins,
            },
            resolveLoader:
            {
                modules:
                [
                    "node_modules",
                    path.resolve(__dirname, "./loaders"),
                    path.resolve(__dirname, "../node_modules"),
                    path.resolve(__dirname, "../node_modules", "@surface")
                ]
            },
        };

        return deepMergeCombine(webpackConfiguration, userWebpack);
    }

    /**
     * Resolve entries.
     * @param entries Entries to be resolved.
     * @param context Context used to resolve entries.
     */
    private static resolveEntries(context: string, entries: Entry): Entry
    {
        const result: Entry = { };

        if (typeof entries == "function")
        {
            entries = entries.call(undefined) as Entry;
        }

        if (typeof entries == "string")
        {
            entries = [entries];
        }

        if (Array.isArray(entries))
        {
            const tmp: Entry = { };
            for (const entry of entries)
            {
                tmp[path.dirname(entry)] = entry;
            }

            entries = tmp;
        }

        for (const key in entries)
        {
            // Open issue for broken narrowing
            const value   = (entries as Record<string, string|Array<string>>)[key];
            const sources = Array.isArray(value) ? value : [value];

            for (const source of sources.map(x => x.replace(/\/\*$/, "")))
            {
                const sourcePath = path.resolve(context, source);

                if (fs.lstatSync(sourcePath).isDirectory())
                {
                    for (const $module of fs.readdirSync(sourcePath))
                    {
                        const modulePath = path.resolve(sourcePath, $module);
                        if (fs.existsSync(modulePath))
                        {
                            if (fs.lstatSync(modulePath).isDirectory())
                            {
                                const index = fs.readdirSync(modulePath).filter(x => x.match(/index\.[tj]s/))[0];
                                if (index)
                                {
                                    result[`${key}/${$module}`] = `${source}/${$module}/${index}`;
                                }
                            }
                            else
                            {
                                result[`${source}/${path.parse($module).name}`] = `${source}/${$module}`;
                            }
                        }
                        else
                        {
                            throw new Error("Invalid path");
                        }
                    }
                }
                else
                {
                    this.setOrPush(result, key, source);
                }
            }
        }

        return result;
    }

    /**
     * Set or push value in a string|Array<string> value of the object.
     * @param source Target object.
     * @param key    Key of the object.
     * @param value  Value to be setted or pushed.
     */
    private static setOrPush(source: Indexer<string|Array<string>>, key: string, value: string): void
    {
        const target = source[key];

        if (!target)
        {
            source[key] = value;
        }
        else if (!Array.isArray(target))
        {
            source[key] = [target].concat(value);
        }
        else
        {
            target.push(value);
        }
    }

    public static async execute(task?: TasksType, config?: string, enviroment?: EnviromentType, watch?: boolean, statsLevel?: webpack.Stats.Preset): Promise<void>
    {
        task       = task       ?? TasksType.build;
        config     = config     ?? "./";
        enviroment = enviroment ?? EnviromentType.development;
        watch      = watch      ?? false;

        const wepackconfig = this.getConfig(config, enviroment);

        switch (task)
        {
            case TasksType.build:
            default:
                await this.build(wepackconfig, enviroment, watch, statsLevel);
                break;
            case TasksType.clean:
                await this.clean(wepackconfig);
                break;
            case TasksType.rebuild:
                await this.clean(wepackconfig);
                await this.build(wepackconfig, enviroment, watch, statsLevel);
                break;
        }
    }
}