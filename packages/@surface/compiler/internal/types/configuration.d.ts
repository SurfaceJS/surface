import type HtmlWebpackPlugin from "html-webpack-plugin";
import type WebpackDevServer  from "webpack-dev-server";

type Configuration =
{
    compilations?:   Configuration[],
    context?:        string,
    copyFiles?:      (string | { from: string, to: string })[],
    devServer?:      WebpackDevServer.Configuration,
    entry?:          WebpackTypes.Configuration["entry"],
    eslintrc?:       string,
    filename?:       string,
    forceTs?:        boolean | string[],
    htmlTemplate?:   string | HtmlWebpackPlugin.Options,
    output?:         string,
    publicPath?:     string,
    tsconfig?:       string,
    useWorkbox?:     boolean,
    webpackConfig?:  WebpackTypes.Configuration,
};

export default Configuration;