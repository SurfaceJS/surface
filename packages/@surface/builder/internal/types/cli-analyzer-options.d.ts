import type { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

type CliAnalyzerOptions =
{
    analyzerMode?:           BundleAnalyzerPlugin.Options["analyzerMode"],
    analyzerDefaultSizes?:   BundleAnalyzerPlugin.Options["defaultSizes"],
    analyzerExcludeAssets?:  string | string[],
    analyzerHost?:           string,
    analyzerLogLevel?:       BundleAnalyzerPlugin.Options["logLevel"],
    analyzerOpen?:           boolean,
    analyzerPort?:           number | "auto",
    analyzerReportFilename?: string,
    analyzerReportTitle?:    string,
};

export default CliAnalyzerOptions;
