import path    from "path";
import webpack from "webpack";

export const loaders =
{
    cache:
    {
        loader: "cache-loader",
        options:
        {
            cacheDirectory: path.resolve(__dirname, "cache")
        }
    },
    css:
    {
        loader: "css-loader"
    },
    file:
    {
        loader: "file-loader",
        options: { name: "[hash].[ext]", outputPath: "resources" }
    },
    html:
    {
        loader: "html-loader",
        options:
        {
            attrs:    ["img:src", "link:href", "script:src"],
            minimize: true
        }
    },
    htmlRequire:
    {
        loader: "html-require-loader"
    },
    istanbul:
    {
        loader: "istanbul-instrumenter-loader",
        options:
        {
            esModules:        true,
            produceSourceMap: true
        }
    },
    resolveUrl: { loader: "resolve-url-loader" },
    sass:
    {
        loader: "sass-loader"
    },
    thread:
    {
        loader: "thread-loader",
        options:
        {
          // there should be 1 cpu for the fork-ts-checker-webpack-plugin
          workers: require("os").cpus().length - 1,
        },
    },
    toString:
    {
        loader: "to-string-loader"
    },
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

export const webpackConfig: webpack.Configuration =
{
    devtool: "#source-map",
    resolve:
    {
        alias:      { tslib: path.resolve(__dirname, "../node_modules", "tslib") },
        extensions: [".ts", ".js"],
        modules:    [".", "node_modules"]
    },
    resolveLoader:
    {
        modules:
        [
            "node_modules",
            path.resolve(__dirname, "../node_modules"),
            path.resolve(__dirname, "../node_modules", "@surface")
        ]
    },
    module:
    {
        rules:
        [
            {
                test: /\.(png|jpe?g|svg|ttf|woff)$/,
                use:  loaders.file
            },
            {
                test: /\.s[ac]ss$/,
                use:
                [
                    loaders.toString,
                    loaders.css,
                    loaders.resolveUrl,
                    loaders.sass
                ]
            },
            {
                test: /\.html$/,
                use:
                [
                    loaders.htmlRequire,
                    loaders.html
                ]
            },
            {
                test: /\.ts$/,
                use:
                [
                    loaders.cache,
                    loaders.thread,
                    //loaders.istanbul,
                    loaders.ts
                ],
            },
        ]
    }
};