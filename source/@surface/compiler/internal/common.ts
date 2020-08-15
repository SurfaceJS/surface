/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable max-lines-per-function */
import os                         from "os";
import path                       from "path";
import { deepMergeCombine }       from "@surface/core";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import HtmlWebpackPlugin          from "html-webpack-plugin";
import TerserWebpackPlugin        from "terser-webpack-plugin";
import webpack                    from "webpack";
import EnviromentType             from "./enums/enviroment-type";
import ForceTsResolvePlugin       from "./plugins/force-ts-resolve-plugin";
import IConfiguration             from "./types/configuration";

type DevServerOptions = { host: string, port: number };
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

function configureDevServerEntry(entry: WebpackEntry, publicPath: string, devServerOptions: DevServerOptions): WebpackEntry
{
    const webpackDevServerClient = `webpack-dev-server/client?http://${devServerOptions.host}:${devServerOptions.port}${publicPath}`;
    const webpackHotDevServer    = "webpack/hot/dev-server";

    return Array.isArray(entry)
        ? [webpackDevServerClient, webpackHotDevServer, ...entry]
        : typeof entry == "object"
            ? { [webpackDevServerClient]: webpackDevServerClient, [webpackHotDevServer]: webpackHotDevServer, ...entry }
            : typeof entry == "string"
                ? [webpackDevServerClient, webpackHotDevServer, entry]
                : entry;
}

// eslint-disable-next-line import/prefer-default-export
export function buildConfiguration(enviroment: EnviromentType, configuration: IConfiguration, devServerOptions?: DevServerOptions): webpack.Configuration
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

    if (configuration.hot && enviroment != EnviromentType.Production)
    {
        plugins.push(new webpack.HotModuleReplacementPlugin());
    }

    plugins.push(new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/]));
    plugins.push(new ForkTsCheckerWebpackPlugin({ eslint: { configFile: configuration.eslintrc, files: `${configuration.context}/**/*.{js,ts}` }, typescript: { build: true, configFile: configuration.tsconfig } }));
    plugins.push(new HtmlWebpackPlugin(typeof configuration.htmlTemplate == "string" ? { template: configuration.htmlTemplate } : configuration.htmlTemplate));

    const isProduction = enviroment == EnviromentType.Production;

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
        entry:   devServerOptions
            ? configureDevServerEntry(configuration.entry!, publicPath, devServerOptions)
            : configuration.entry,
        mode:    enviroment,
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

    return deepMergeCombine(webpackConfiguration, configuration.webpackConfig ?? { });
}