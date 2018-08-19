import { ObjectLiteral }        from "@surface/core";
import HtmlTemplatePlugin       from "@surface/html-template-plugin";
import SimblingResolvePlugin    from "@surface/simbling-resolve-plugin";
import { Configuration, Stats } from "webpack"
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