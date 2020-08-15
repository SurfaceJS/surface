import type webpack             from "webpack";
import WebpackDevServer         from "webpack-dev-server";
import HtmlWebpackPluginOptions from "./html-webpack-plugin-options";

type Configuration =
{
    context?:       string,
    devServer?:     WebpackDevServer.Configuration,
    entry?:         string | string[] | webpack.Entry | webpack.EntryFunc,
    eslintrc?:      string,
    filename?:      string,
    forceTs?:       boolean | string[],
    hot?:           boolean,
    htmlTemplate?:  string | HtmlWebpackPluginOptions,
    logLevel?:      webpack.Stats.ToStringOptions,
    output?:        string,
    publicPath?:    string,
    tsconfig?:      string,
    webpackConfig?: webpack.Configuration,
};

export default Configuration;