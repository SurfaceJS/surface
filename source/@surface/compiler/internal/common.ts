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
import IConfiguration             from "./interfaces/configuration";
import ForceTsResolvePlugin       from "./plugins/force-ts-resolve-plugin";

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
            // There should be 1 cpu for the fork-ts-checker-webpack-plugin
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

// eslint-disable-next-line import/prefer-default-export
export function buildConfiguration(enviroment: EnviromentType, configuration: IConfiguration): webpack.Configuration
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
            publicPath: configuration.publicPath,
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
                "tslib": path.resolve(__dirname, "../node_modules", "tslib"),
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