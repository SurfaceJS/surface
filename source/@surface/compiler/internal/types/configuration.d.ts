import HtmlWebpackPlugin from "html-webpack-plugin";
import type webpack      from "webpack";
import WebpackDevServer  from "webpack-dev-server";

type Configuration =
{
    context?:       string,
    devServer?:     WebpackDevServer.Configuration,
    entry?:         webpack.Configuration["entry"],
    eslintrc?:      string,
    filename?:      string,
    forceTs?:       boolean | string[],
    htmlTemplate?:  string | HtmlWebpackPlugin.Options,
    output?:        string,
    publicPath?:    string,
    tsconfig?:      string,
    webpackConfig?: webpack.Configuration,
};

export default Configuration;