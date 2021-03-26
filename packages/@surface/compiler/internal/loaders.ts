import os from "os";

const loaders =
{
    appManifest: { loader: "app-manifest-loader", options: { esModule: false } },
    css:         { loader: "css-loader", options: { esModule: false, sourceMap: true } },
    extract:     { loader: "extract-loader" },
    file:
    {
        loader:  "file-loader",
        options: { esModule: false, name: "[hash].[ext]" },
    },
    fileAssets:
    {
        loader:  "file-loader",
        options: { esModule: false, name: "[hash].[ext]", outputPath: "assets" },
    },
    fileAssetsCss:
    {
        loader:  "file-loader",
        options: { esModule: false, name: "[hash].css", outputPath: "assets" },
    },
    html:
    {
        loader:  "html-loader",
        options:
        {
            esModule: false,
            minimize: true,
            sources:  true,
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
    sass:   { loader: "sass-loader" },
    style:  { loader: "style-loader" },
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

export default loaders;