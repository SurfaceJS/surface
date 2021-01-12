import os from "os";

const loaders =
{
    appManifest: { loader: "app-manifest-loader" },
    css:         { loader: "css-loader", options: { esModule: false, sourceMap: true } },
    extract:     { loader: "extract-loader" },
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