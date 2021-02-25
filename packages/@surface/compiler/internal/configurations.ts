/* eslint-disable @typescript-eslint/indent */
/* eslint-disable max-lines-per-function */
import type { URL }                               from "url";
import { deepMergeCombine }                       from "@surface/core";
import CopyPlugin                                 from "copy-webpack-plugin";
import ForkTsCheckerWebpackPlugin                 from "fork-ts-checker-webpack-plugin";
import type { ForkTsCheckerWebpackPluginOptions } from "fork-ts-checker-webpack-plugin/lib/ForkTsCheckerWebpackPluginOptions.js";
import HtmlWebpackPlugin                          from "html-webpack-plugin";
import TerserWebpackPlugin                        from "terser-webpack-plugin";
import webpack                                    from "webpack";
import { BundleAnalyzerPlugin }                   from "webpack-bundle-analyzer";
import WorkboxPlugin                              from "workbox-webpack-plugin";
import { createOnlyDefinedProxy }                 from "./common.js";
import loaders                                    from "./loaders.js";
import ForceTsResolvePlugin                       from "./plugins/force-ts-resolve-plugin.js";
import type CliAnalyzerOptions                    from "./types/cli-analyzer-options";
import type CliBuildOptions                       from "./types/cli-build-options";
import type Configuration                         from "./types/configuration";

function configureDevServerEntry(entry: webpack.Entry | undefined, url: URL): webpack.Entry | undefined
{
    const webpackDevServerClient = `webpack-dev-server/client?${url}`;
    const webpackHotDevServer    = "webpack/hot/dev-server";

    return Array.isArray(entry)
        ? [webpackDevServerClient, webpackHotDevServer, ...entry]
        : typeof entry == "object"
            ? { [webpackDevServerClient]: webpackDevServerClient, [webpackHotDevServer]: webpackHotDevServer, ...entry }
            : typeof entry == "string"
                ? [webpackDevServerClient, webpackHotDevServer, entry]
                : entry;
}

export function createAnalyzerConfiguration(configuration: Configuration, options: CliAnalyzerOptions): webpack.Configuration | webpack.Configuration[]
{
    const logging = !options.logging
        ? "none"
        : options.logging == true
            ? "info"
            : options.logging;

    const logLevel: BundleAnalyzerPlugin.Options["logLevel"] =
        logging == "none"
            ? "silent"
            : logging == "verbose" || logging == "log"
                ? "info"
                :  logging;

    const bundleAnalyzerPluginOptions: BundleAnalyzerPlugin.Options =
    {
        ...configuration.bundlerAnalyzer,
        analyzerHost:   options.analyzerHost,
        analyzerMode:   options.analyzerMode ?? "static",
        analyzerPort:   options.analyzerPort,
        defaultSizes:   options.defaultSizes,
        excludeAssets:  options.excludeAssets,
        logLevel,
        openAnalyzer:   options.openAnalyzer,
        reportFilename: options.reportFilename,
    };

    const extendedConfiguration: webpack.Configuration =
    {
        mode:    options.mode,
        plugins: [new BundleAnalyzerPlugin(createOnlyDefinedProxy(bundleAnalyzerPluginOptions))],
    };

    if (configuration.compilations)
    {
        return configuration.compilations.map(x => createConfiguration(x, createOnlyDefinedProxy(extendedConfiguration)));
    }

    return createConfiguration(configuration, createOnlyDefinedProxy(extendedConfiguration));
}

export function createConfiguration(configuration: Configuration, extendedConfiguration: webpack.Configuration): webpack.Configuration
{
    const resolvePlugins: webpack.ResolveOptions["plugins"] = [];
    const plugins:        webpack.WebpackPluginInstance[]   = [];

    if (configuration.forceTs)
    {
        const paths = !Array.isArray(configuration.forceTs)
            ? []
            : configuration.forceTs;

        resolvePlugins.push(new ForceTsResolvePlugin(paths));
    }

    const forkTsCheckerWebpackPluginOptions: ForkTsCheckerWebpackPluginOptions =
    {
        eslint:
        {
            files:   `${configuration.context}/**/*.{js,ts}`,
            options: createOnlyDefinedProxy
            ({
                configFile: configuration.eslintrc,
                cwd:        configuration.context,
            }),
        },
        typescript: createOnlyDefinedProxy
        ({
            build:      true,
            configFile: configuration.tsconfig,
            context:    configuration.context,
        }),
    };

    plugins.push(new webpack.WatchIgnorePlugin({ paths: [/\.js$/, /\.d\.ts$/] }));
    plugins.push(new ForkTsCheckerWebpackPlugin(forkTsCheckerWebpackPluginOptions));

    if (configuration.htmlTemplate)
    {
    const htmlWebpackPluginOptions = typeof configuration.htmlTemplate == "string"
        ? { template: configuration.htmlTemplate }
        : configuration.htmlTemplate;

    plugins.push(new HtmlWebpackPlugin(htmlWebpackPluginOptions));
    }

    if (configuration.copyFiles)
    {
        const patterns = configuration.copyFiles
            .map
            (
                pattern =>
                {
                    if (typeof pattern == "string")
                    {
                        const [from, to = configuration.output!] = pattern.split(":");

                        return { from, to };
                    }

                    return pattern;
                },
            );

        const copyPlugin = new CopyPlugin({ patterns });

        plugins.push(copyPlugin);
    }

    if (configuration.useWorkbox)
    {
        plugins.push(new WorkboxPlugin.GenerateSW({ clientsClaim: true, skipWaiting: true }));
    }

    const isProduction = extendedConfiguration.mode == "production";

    const tersePlugin = new TerserWebpackPlugin
    ({
        extractComments: true,
        parallel:        true,
        terserOptions:
        {
            compress: true,
            mangle:   true,
        },
    });

    const webpackConfiguration: webpack.Configuration =
    {
        cache:
        {
            name: ".cache",
            type: "filesystem",
        },
        context: configuration.context,
        devtool: isProduction ? false : "source-map",
        entry:   configuration.entry,
        mode:    "development",
        module:
        {
            rules:
            [
                {
                    test: /(manifest\.webmanifest|browserconfig\.xml)$/,
                    use:
                    [
                        loaders.file,
                        loaders.appManifest,
                    ],
                },
                {
                    test: /\.(png|jpe?g|svg|ttf|woff2?|eot)$/,
                    use:  loaders.fileAssets,
                },
                {
                    oneOf:
                    [
                        {
                            resourceQuery: /global/,
                            use:
                            [
                                loaders.style,
                                loaders.css,
                                loaders.resolveUrl,
                                loaders.sass,
                            ],
                        },
                        {
                            resourceQuery: /raw/,
                            use:
                            [
                                loaders.toString,
                                loaders.css,
                                loaders.resolveUrl,
                                loaders.sass,
                            ],
                        },
                        {
                            resourceQuery: /file/,
                            use:
                            [
                                loaders.fileAssetsCss,
                                loaders.extract,
                                loaders.css,
                                loaders.resolveUrl,
                                loaders.sass,
                            ],
                        },
                        {
                            use:
                            [
                                loaders.toString,
                                loaders.css,
                                loaders.resolveUrl,
                                loaders.sass,
                            ],
                        },
                    ],
                    test:  /\.s?css$/,
                },
                {
                    test: /\.html$/,
                    use:  loaders.html,
                },
                {
                    test: /\.ts$/,
                    use:
                    [
                        loaders.thread,
                        loaders.ts,
                    ],
                },
            ],
        },
        optimization:
        {
            chunkIds:             isProduction ? "total-size" : "named",
            concatenateModules:   isProduction,
            emitOnErrors:         false,
            flagIncludedChunks:   isProduction,
            mergeDuplicateChunks: isProduction,
            minimize:             isProduction,
            minimizer:            [tersePlugin as webpack.WebpackPluginInstance],
            moduleIds:            isProduction ? "size" : "named",
            providedExports:      true,
            usedExports:          isProduction,
        },
        output:
        {
            filename:   configuration.filename,
            path:       configuration.output,
            pathinfo:   !isProduction,
            publicPath: configuration.publicPath,
        },
        performance:
        {
            hints: isProduction ? "warning" : false,
        },
        plugins,
        resolve:
        {
            extensions:     [".ts", ".js", ".json", ".wasm"],
            plugins:        resolvePlugins,
            preferRelative: true,
        },
        resolveLoader:
        {
            preferRelative: true,
        },
    };

    return deepMergeCombine(webpackConfiguration, extendedConfiguration, (configuration.webpackConfig as webpack.Configuration | undefined) ?? { });
}

export function createBuildConfiguration(configuration: Configuration, options: CliBuildOptions): webpack.Configuration | webpack.Configuration[]
{
    if (configuration.compilations)
    {
        return configuration.compilations.map(x => createConfiguration(x, createOnlyDefinedProxy({ mode: options.mode })));
    }

    return createConfiguration(configuration, createOnlyDefinedProxy({ mode: options.mode }));
}

export function createDevServerConfiguration(configuration: Configuration, url: URL): webpack.Configuration | webpack.Configuration[]
{
    const extendedConfiguration: webpack.Configuration =
    {
        entry:   configureDevServerEntry(configuration.entry, url),
        mode:    "development",
        plugins: [new webpack.HotModuleReplacementPlugin()],
    };

    if (configuration.compilations)
    {
        return configuration.compilations.map(x => createConfiguration(x, extendedConfiguration));
    }

    return createConfiguration(configuration, extendedConfiguration);
}