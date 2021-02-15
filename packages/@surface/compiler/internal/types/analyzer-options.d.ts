import type webpack                  from "webpack";
import type { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import type Logging                  from "./logging";

type AnalyzerOptions =
{
    analyzerMode?:   BundleAnalyzerPlugin.Options["analyzerMode"],
    defaultSizes?:   BundleAnalyzerPlugin.Options["defaultSizes"],
    exclude?:        string | string[],
    host?:           string,
    logging?:        Logging,
    logLevel?:       BundleAnalyzerPlugin.Options["logLevel"],
    mode?:           webpack.Configuration["mode"],
    open?:           boolean,
    port?:           number | "auto",
    reportFilename?: string,
};

export default AnalyzerOptions;
