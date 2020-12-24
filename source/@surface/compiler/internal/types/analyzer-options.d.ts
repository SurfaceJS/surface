import type webpack                  from "webpack";
import type { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

type AnalyzerOptions =
{
    defaultSizes?:   BundleAnalyzerPlugin.Options["defaultSizes"],
    exclude?:        string | string[],
    host?:           string,
    logLevel?:       BundleAnalyzerPlugin.Options["logLevel"],
    analyzerMode?:   BundleAnalyzerPlugin.Options["analyzerMode"],
    mode?:           webpack.Configuration["mode"],
    open?:           boolean,
    port?:           number | "auto",
    reportFilename?: string,
};

export default AnalyzerOptions;
