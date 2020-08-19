/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
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
import ForceTsResolvePlugin                  from "./plugins/force-ts-resolve-plugin";
import AnalyzerOptions                       from "./types/analyzer-options";
import BuildOptions                          from "./types/build-options";
import Configuration                         from "./types/configuration";
import DevServerOptions                      from "./types/dev-serve-options";
import ExportOptions                         from "./types/export-options";

type WebpackEntry = string | string[] | webpack.Entry | webpack.EntryFunc;

const loaders =
{
    cache:
    {
        loader:  "cache-loader",
        options:
        {
            cacheDirectory: path.resolve(__dirname, ".cache"),
        },
    },
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

function configureDevServerEntry(entry: WebpackEntry, publicPath: string, serveOptions: DevServerOptions): WebpackEntry
{
    const webpackDevServerClient = `webpack-dev-server/client?http://${serveOptions.host}:${serveOptions.port}${publicPath}`;
    const webpackHotDevServer    = "webpack/hot/dev-server";

    return Array.isArray(entry)
        ? [webpackDevServerClient, webpackHotDevServer, ...entry]
        : typeof entry == "object"
            ? { [webpackDevServerClient]: webpackDevServerClient, [webpackHotDevServer]: webpackHotDevServer, ...entry }
            : typeof entry == "string"
                ? [webpackDevServerClient, webpackHotDevServer, entry]
                : entry;
}

export const analyzerDefaultSizesPattern = /^parsed|stat|gzip$/i;
export const analyzerLogLevelPattern     = /^info|warn|error|silent$/i;
export const analyzerModePattern         = /^server|static|json|disabled$/i;
export const booleanPattern              = /^true|false$/i;
export const logLevelPattern             = /^errors-only|minimal|none|normal|verbose$/i;
export const modePattern                 = /^development|none|production$/i;
export const targetPattern               = /^node|web$/i;

export function createAnalyzerConfiguration(options: AnalyzerOptions, configuration: Configuration): webpack.Configuration
{
    const bundleAnalyzerPluginOptions: BundleAnalyzerPlugin.Options =
    {
        analyzerHost:   options.host,
        analyzerMode:   options.analyzerMode ?? "static",
        analyzerPort:   options.port,
        defaultSizes:   options.defaultSizes,
        excludeAssets:  options.exclude,
        logLevel:       options.logLevel,
        openAnalyzer:   options.open,
        reportFilename: options.reportFilename,
    };

    const extendedConfiguration: webpack.Configuration =
    {
        plugins: [new BundleAnalyzerPlugin(bundleAnalyzerPluginOptions)],
    };

    return createBuildConfiguration({ hot: false, mode: options.mode }, configuration, extendedConfiguration);
}

export function createBuildConfiguration(options: BuildOptions, configuration: Configuration, extendedConfiguration: webpack.Configuration = { }): webpack.Configuration
{
    const resolvePlugins: webpack.ResolvePlugin[] = [];
    const plugins:        webpack.Plugin[]        = [];

    if (configuration.forceTs)
    {
        const paths = !Array.isArray(configuration.forceTs)
            ? []
            : configuration.forceTs;

        resolvePlugins.push(new ForceTsResolvePlugin(paths));
    }

    if (options.hot && options.mode != "production")
    {
        plugins.push(new webpack.HotModuleReplacementPlugin());
    }

    const forkTsCheckerWebpackPluginOptions: ForkTsCheckerWebpackPluginOptions =
    {
        eslint:
        {
            files:   `${configuration.context}/**/*.{js,ts}`,
            options:
            {
                configFile: configuration.eslintrc,
            },
        },
        typescript:
        {
            build:      true,
            configFile: configuration.tsconfig,
        },
    };

    const htmlWebpackPluginOptions = typeof configuration.htmlTemplate == "string"
        ? { template: configuration.htmlTemplate }
        : configuration.htmlTemplate;

    plugins.push(new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/]));
    plugins.push(new ForkTsCheckerWebpackPlugin(forkTsCheckerWebpackPluginOptions));

    if (!options.target || options.target == "web")
    {
        plugins.push(new HtmlWebpackPlugin(htmlWebpackPluginOptions));
    }

    const isProduction = options.mode == "production";

    const tersePlugin = new TerserWebpackPlugin
    ({
        cache:           true,
        extractComments: true,
        parallel:        true,
        terserOptions:
        {
            compress: true,
            mangle:   true,
        },
    });

    const publicPath = configuration.publicPath
        ? (configuration.publicPath.startsWith("/") ? "" : "/") + configuration.publicPath.replace(/\/$/, "")
        : "";

    const webpackConfiguration: webpack.Configuration =
    {
        context: configuration.context,
        devtool: isProduction ? false : "#source-map",
        entry:   configuration.entry,
        mode:    options.mode,
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
                        loaders.cache,
                        loaders.thread,
                        loaders.ts,
                    ],
                },
            ],
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
                        reuseExistingChunk: true,
                    },
                    vendors:
                    {
                        priority: -10,
                        test:     /[\\/]node_modules[\\/]/,
                    },
                },
                chunks:             "async",
                maxAsyncRequests:   5,
                maxInitialRequests: 3,
                maxSize:            0,
                minChunks:          1,
                minSize:            30000,
                name:               true,
            },
            usedExports: isProduction,
        },
        output:
        {
            filename:   configuration.filename,
            path:       configuration.output,
            pathinfo:   !isProduction,
            publicPath,
        },
        performance:
        {
            hints: isProduction ? "warning" : false,
        },
        plugins,
        resolve:
        {
            alias:
            {
                "tslib":                  path.resolve(__dirname, "../node_modules", "tslib"),
                "webpack-dev-server":     path.resolve(__dirname, "../node_modules", "webpack-dev-server"),
                "webpack/hot/dev-server": path.resolve(__dirname, "../node_modules", "webpack/hot/dev-server"),
            },
            extensions: [".ts", ".js"],
            modules:    [".", "node_modules"],
            plugins:    resolvePlugins,
        },
        resolveLoader:
        {
            modules:
            [
                "node_modules",
                path.resolve(__dirname, "./loaders"),
                path.resolve(__dirname, "../node_modules"),
            ],
        },
    };

    return deepMergeCombine(webpackConfiguration, extendedConfiguration, configuration.webpackConfig ?? { });
}

export function createDevServerConfiguration(options: DevServerOptions, configuration: Configuration): webpack.Configuration
{
    const extendedConfiguration: webpack.Configuration =
    {
        entry:   configureDevServerEntry(configuration.entry!, configuration.publicPath!, options),
        plugins: [new webpack.HotModuleReplacementPlugin()],
    };

    return createBuildConfiguration(options, configuration, extendedConfiguration);
}

export function createExportConfiguration(options: ExportOptions, configuration: Configuration): webpack.Configuration
{
    const extendedConfiguration: webpack.Configuration =
    {
        output:
        {
            libraryExport: options.libraryExport,
        },
    };

    return createBuildConfiguration(options, configuration, extendedConfiguration);
}

export const parsePattern = (pattern: RegExp) => (value: string = "") => pattern.test(value) && value.toLowerCase();

export function toArray(value: string = ""): string[]
{
    return value.split(",");
}

export function toBoolean(value: string = ""): boolean
{
    return !value
        ? false
        : booleanPattern.test(value)
            ? value.toLowerCase() == "true"
            : false;
}

export function toBooleanOrStringArray(value: string): boolean | string[]
{
    return !value
        ? false
        : booleanPattern.test(value)
            ? value.toLowerCase() == "true"
            : value.split(",");
}