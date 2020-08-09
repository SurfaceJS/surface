import type { Configuration, Entry, EntryFunc, Stats } from "webpack";
import HtmlWebpackPluginOptions                        from "../types/html-webpack-plugin-options";

export default interface IConfiguration
{
    context?:          string;
    entry?:            string | string[] | Entry | EntryFunc;
    filename?:         string;
    forceTs?:          boolean | string[];
    htmlTemplate?:     string | HtmlWebpackPluginOptions;
    output?:           string;
    publicPath?:       string;
    logLevel?:         Stats.ToStringOptions;
    tsconfig?:         string;
    tslint?:           string;
    webpackConfig?:    string | Configuration;
}