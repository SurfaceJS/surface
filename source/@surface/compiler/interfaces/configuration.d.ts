import { Indexer }              from "@surface/core";
import { Configuration, Stats } from "webpack"
import HtmlTemplatePlugin       from "../plugins/html-template-plugin";
import SimblingResolvePlugin    from "../plugins/simbling-priority-plugin";
import { Entry }                from "./types";

export default interface IConfiguration
{
    context:          string;
    entry:            Entry;
    filename:         string;
    output:           string;
    htmlTemplate?:    HtmlTemplatePlugin.IOptions;
    simblingResolve?: SimblingResolvePlugin.IOptions|Array<SimblingResolvePlugin.IOptions>;
    tsconfig?:        string;
    tslint?:          string;
    webpackConfig?:   string|Configuration;
    statsLevel?:      Stats.ToStringOptions;
}