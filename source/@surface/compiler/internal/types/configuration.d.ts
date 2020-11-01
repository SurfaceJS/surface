import HtmlWebpackPlugin from "html-webpack-plugin";
import WebpackDevServer  from "webpack-dev-server";
import WebpackTypes      from "./webpack";

type Configuration =
{
    context?:       string,
    devServer?:     WebpackDevServer.Configuration,
    entry?:         WebpackTypes.Configuration["entry"],
    eslintrc?:      string,
    filename?:      string,
    forceTs?:       boolean | string[],
    htmlTemplate?:  string | HtmlWebpackPlugin.Options,
    output?:        string,
    publicPath?:    string,
    tsconfig?:      string,
    webpackConfig?: WebpackTypes.Configuration,
};

export default Configuration;