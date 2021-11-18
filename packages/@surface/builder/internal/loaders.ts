import os from "os";

const loaders =
{
    css:     { loader: "css-loader" },
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
            happyPackMode:           true,
            onlyCompileBundledFiles: true,
            transpileOnly:           true,
        },
    },
};

export default loaders;