import { Configuration, Stats } from "webpack";
import HtmlTemplatePlugin       from "../plugins/html-template-plugin";
import SimblingResolvePlugin    from "../plugins/simbling-priority-plugin";
import { Entry }                from "./types";

export default interface IConfiguration
{
    context:          string;
    entry:            Entry;
    filename:         string;
    htmlTemplate?:    HtmlTemplatePlugin.IOptions;
    output:           string;
    simblingResolve?: SimblingResolvePlugin.IOptions|Array<SimblingResolvePlugin.IOptions>;
    statsLevel?:      Stats.ToStringOptions;
    tsconfig?:        string;
    tslint?:          string;
    webpackConfig?:   string|Configuration;
}