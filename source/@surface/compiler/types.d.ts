import * as CodeSplitterPlugin     from "@surface/code-splitter-plugin";
import * as HtmlTemplatePlugin     from "@surface/html-template-plugin";
import * as SimblingPriorityPlugin from "@surface/simbling-priority-plugin";
import { ObjectLiteral }           from "@surface/types";
import * as webpack                from "webpack";

export namespace Compiler
{
    export type Entry = string|Array<string>|ObjectLiteral<string>|ObjectLiteral<Array<string>>;

    export interface Config
    {
        context:            string;
        entry:              Entry;
        filename:           string;
        output:             string;
        runtime?:           string;
        codeSplitter?:      CodeSplitterPlugin.IOptions;
        htmlTemplate?:      HtmlTemplatePlugin.IOptions;
        simblingPriority?:  SimblingPriorityPlugin.IOptions|Array<SimblingPriorityPlugin.IOptions>;
        webpackConfig?:     string|webpack.Configuration;
        tsconfig?:          string;
    }
}