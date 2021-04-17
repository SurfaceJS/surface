import type webpack                  from "webpack";
import type { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import type Logging                  from "./logging";

type CliAnalyzerOptions =
{
    analyzerMode?:   BundleAnalyzerPlugin.Options["analyzerMode"],
    defaultSizes?:   BundleAnalyzerPlugin.Options["defaultSizes"],
    excludeAssets?:  string | string[],
    analyzerHost?:   string,
    logging?:        Logging,
    mode?:           webpack.Configuration["mode"],
    openAnalyzer?:   boolean,
    analyzerPort?:   number | "auto",
    reportFilename?: string,
    reportTitle?:    string,
};

export default CliAnalyzerOptions;
