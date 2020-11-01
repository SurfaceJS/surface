/* eslint-disable max-lines-per-function */
import os                                    from "os";
import path                                  from "path";
import { deepMergeCombine }                  from "@surface/core";
import ForkTsCheckerWebpackPlugin            from "fork-ts-checker-webpack-plugin";
import { ForkTsCheckerWebpackPluginOptions } from "fork-ts-checker-webpack-plugin/lib/ForkTsCheckerWebpackPluginOptions";
import HtmlWebpackPlugin                     from "html-webpack-plugin";
import TerserWebpackPlugin                   from "terser-webpack-plugin";
import webpack                               from "webpack";
import { BundleAnalyzerPlugin }              from "webpack-bundle-analyzer";
import { removeUndefined }                   from "./common";
import ForceTsResolvePlugin                  from "./plugins/force-ts-resolve-plugin";
import AnalyzerOptions                       from "./types/analyzer-options";
import BuildOptions                          from "./types/build-options";
import Configuration                         from "./types/configuration";

type ClientOptions = { host: string, port: number, publicPath: string };

const loaders =
{
    css:     { loader: "css-loader" },
    extract: { loader: "extract-loader" },
    file:
    {
        loader:  "file-loader",
        options: { name: "[hash].[ext]", outputPath: "resources" },
    },
    fileCss:
    {
        loader:  "file-loader",
        options: { esModule: false, name: "[hash].css", outputPath: "resources" },
    },
    html:
    {
        loader:  "html-loader",
        options:
        {
            attributes: true,
            esModule:   true,
            minimize:   true,
        },
    },
    resolveUrl:
    {
        loader:  "resolve-url-loader",
        options:
        {
            removeCR: true,
        },
    },
    sass:       { loader: "sass-loader" },
    style:      { loader: "style-loader" },
    thread:
    {
        loader:  "thread-loader",
        options:
        {
            workers: os.cpus().length - 1,
        },
    },
    toString: { loader: "to-string-loader" },
    ts:
    {
        loader:  "ts-loader",
        options:
        {
            configFile:              "tsconfig.json",
            happyPackMode:           true,
            onlyCompileBundledFiles: true,
            transpileOnly:           true,
        },
    },
};

function configureDevServerEntry(entry: webpack.Entry | undefined, clientOptions: ClientOptions): webpack.Entry | undefined
{
    const webpackDevServerClient = `webpack-dev-server/client?http://${clientOptions.host}:${clientOptions.port}${clientOptions.publicPath}`;
    const webpackHotDevServer    = "webpack/hot/dev-server";

    return Array.isArray(entry)
        ? [webpackDevServerClient, webpackHotDevServer, ...entry]
        : typeof entry == "object"
            ? { [webpackDevServerClient]: webpackDevServerClient, [webpackHotDevServer]: webpackHotDevServer, ...entry }
            : typeof entry == "string"
                ? [webpackDevServerClient, webpackHotDevServer, entry]
                : entry;
}

export function createAnalyzerConfiguration(configuration: Configuration, options: AnalyzerOptions): webpack.Configuration
{
    const bundleAnalyzerPluginOptions: BundleAnalyzerPlugin.Options = removeUndefined
    ({
        analyzerHost:   options.host,
        analyzerMode:   options.analyzerMode ?? "static",
        analyzerPort:   options.port,
        defaultSizes:   options.defaultSizes,
        excludeAssets:  options.exclude,
        logLevel:       options.logLevel,
        openAnalyzer:   options.open,
        reportFilename: options.reportFilename,
    });

    const extendedConfiguration: webpack.Configuration = removeUndefined
    ({
        mode:    options.mode,
        plugins: [new BundleAnalyzerPlugin(bundleAnalyzerPluginOptions)],
    });

    return createConfiguration(configuration, extendedConfiguration);
}

export function createConfiguration(configuration: Configuration, extendedConfiguration: webpack.Configuration, hot: boolean = false): webpack.Configuration
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

    if (hot && extendedConfiguration.mode != "production")
    {
        plugins.push(new webpack.HotModuleReplacementPlugin());
    }

    const forkTsCheckerWebpackPluginOptions: ForkTsCheckerWebpackPluginOptions =
    {
        eslint:
        {
            files:   `${configuration.context}/**/*.{js,ts}`,
            options: removeUndefined
            ({
                configFile: configuration.eslintrc,
            }),
        },
        typescript: removeUndefined
        ({
            build:      true,
            configFile: configuration.tsconfig,
            context:    configuration.context,
        }),
    };

    const htmlWebpackPluginOptions = typeof configuration.htmlTemplate == "string"
        ? { template: configuration.htmlTemplate }
        : configuration.htmlTemplate;

    plugins.push(new webpack.WatchIgnorePlugin({ paths: [/\.js$/, /\.d\.ts$/] }));
    plugins.push(new ForkTsCheckerWebpackPlugin(forkTsCheckerWebpackPluginOptions));
    plugins.push(new HtmlWebpackPlugin(htmlWebpackPluginOptions));

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

    const alias: Record<string, string> = process.env.SURFACE_ENVIRONMENT == "development"
        ? {
            "tslib":                  path.resolve(__dirname, "../node_modules", "tslib"),
            "webpack-dev-server":     path.resolve(__dirname, "../node_modules", "webpack-dev-server"),
            "webpack/hot/dev-server": path.resolve(__dirname, "../node_modules", "webpack/hot/dev-server"),
        }
        : { "webpack/hot/dev-server": "webpack/hot/dev-server" };

    const modules = process.env.SURFACE_ENVIRONMENT == "development"
        ? [
            path.resolve(__dirname, "./loaders"),
            path.resolve(__dirname, "../node_modules"),
        ]
        : ["node_modules"];

    const webpackConfiguration: webpack.Configuration =
    {
        cache:
        {
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
                    test: /\.(png|jpe?g|svg|ttf|woff2?|eot)$/,
                    use:  loaders.file,
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
                                loaders.fileCss,
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
            alias,
            extensions: [".ts", ".js"],
            modules:    [".", "node_modules"],
            plugins:    resolvePlugins,
        },
        resolveLoader:
        {
            modules,
        },
    };

    return deepMergeCombine(webpackConfiguration, extendedConfiguration, configuration.webpackConfig ?? { });
}

export function createBuildConfiguration(configuration: Configuration, options: BuildOptions): webpack.Configuration
{
    return createConfiguration(configuration, removeUndefined({ mode: options.mode }));
}

export function createDevServerConfiguration(configuration: Configuration, options: ClientOptions): webpack.Configuration
{
    const extendedConfiguration: webpack.Configuration =
    {
        entry:   configureDevServerEntry(configuration.entry, options),
        mode:    "development",
        plugins: [new webpack.HotModuleReplacementPlugin()],
    };

    return createConfiguration(configuration, extendedConfiguration);
}