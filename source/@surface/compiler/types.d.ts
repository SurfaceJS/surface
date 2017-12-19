import * as HtmlTemplatePlugin    from "@surface/html-template-plugin";
import * as SimblingResolvePlugin from "@surface/simbling-resolve-plugin";
import { ObjectLiteral }          from "@surface/types";
import * as webpack               from "webpack";

export namespace Compiler
{
    export type Entry = string|Array<string>|ObjectLiteral<string>|ObjectLiteral<Array<string>>;

    export interface Config
    {
        context:          string;
        entry:            Entry;
        filename:         string;
        output:           string;
        htmlTemplate?:    HtmlTemplatePlugin.IOptions;
        runtime?:         string;
        simblingResolve?: SimblingResolvePlugin.IOptions|Array<SimblingResolvePlugin.IOptions>;
        tsconfig?:        string;
        tslint?:          string;
        webpackConfig?:   string|webpack.Configuration;
        statsLevel?:      webpack.Stats.ToStringOptions;
    }
}