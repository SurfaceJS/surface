import webpack               from "webpack";
import HtmlTemplatePlugin    from "../plugins/html-template-plugin";
import SimblingResolvePlugin from "../plugins/simbling-priority-plugin";
import { Entry }             from "./types";

type Configuration =
{
    context:          string,
    entry:            Entry,
    filename:         string,
    htmlTemplate?:    HtmlTemplatePlugin.IOptions,
    output:           string,
    simblingResolve?: SimblingResolvePlugin.IOptions | SimblingResolvePlugin.IOptions[],
    statsLevel?:      webpack.Stats.ToStringOptions,
    tsconfig?:        string,
    tslint?:          string,
    webpackConfig?:   string | webpack.Configuration,
};

export default Configuration;