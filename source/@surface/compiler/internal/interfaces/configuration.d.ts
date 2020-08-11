import type { Configuration, Entry, EntryFunc, Stats } from "webpack";
import HtmlWebpackPluginOptions                        from "../types/html-webpack-plugin-options";

export default interface IConfiguration
{
    context?:       string;
    entry?:         string | string[] | Entry | EntryFunc;
    eslintrc?:      string;
    filename?:      string;
    forceTs?:          boolean | string[];
    htmlTemplate?:  string | HtmlWebpackPluginOptions;
    logLevel?:      Stats.ToStringOptions;
    output?:        string;
    publicPath?:    string;
    tsconfig?:      string;
    webpackConfig?: Configuration;
}