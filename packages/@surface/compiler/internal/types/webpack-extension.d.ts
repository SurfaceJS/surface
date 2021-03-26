import type { MergeRules } from "@surface/core";
import type webpack        from "webpack";

type WebpackExtension =
{
    configuration?:     string | webpack.Configuration,
    mergeRules?:        MergeRules<webpack.Configuration>,
    postConfiguration?: string | ((configuration: webpack.Configuration) => Promise<webpack.Configuration>),
};

export default WebpackExtension;
