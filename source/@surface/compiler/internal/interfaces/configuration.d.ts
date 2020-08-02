import type HtmlWebpackPlugin   from "html-webpack-plugin";
import { Configuration, Stats } from "webpack";
import SimblingResolvePlugin    from "../plugins/simbling-priority-plugin";
import { Entry }                from "./types";


export default interface IConfiguration
{
    context:          string;
    entry:            Entry;
    filename:         string;
    output:           string;
    htmlTemplate?:    HtmlWebpackPlugin.IOptions;
    simblingResolve?: SimblingResolvePlugin.IOptions | SimblingResolvePlugin.IOptions[];
    statsLevel?:      Stats.ToStringOptions;
    tsconfig?:        string;
    tslint?:          string;
    webpackConfig?:   string | Configuration;
}