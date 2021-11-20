import os from "os";

const loaders =
{
    css:     { loader: "css-loader", options: { sourceMap: true } },
    extract: { loader: "extract-loader" },
    html:
    {
        loader:  "html-loader",
        options:
        {
            minimize: true,
            sources:  true,
        },
    },
    resolveUrl:
    {
        loader:  "resolve-url-loader",
        options:
        {
            removeCR:  true,
            sourceMap: true,
        },
    },
    sass:   { loader: "sass-loader", options: { sourceMap: true } },
    style:  { loader: "style-loader" },
    thread:
    {
        loader:  "thread-loader",
        options:
        {
            workers: os.cpus().length - 1,
        },
    },
    toString: { loader: "to-string-loader", options: { sourceMap: true } },
    ts:
    {
        loader:  "ts-loader",
        options:
        {
            happyPackMode:           true,
            onlyCompileBundledFiles: true,
            transpileOnly:           true,
        },
    },
};

export default loaders;