import type HtmlWebpackPlugin        from "html-webpack-plugin";
import type webpack                  from "webpack";
import type { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import type WebpackDevServer         from "webpack-dev-server";

type Configuration =
{
    bundlerAnalyzer?: BundleAnalyzerPlugin.Options,

    /** Configurations used by multicompiler. When specified, all root configuration will merge with it. */
    compilations?: Configuration[],

    /** The base directory for resolving the entry option. */
    context?: string,

    /** File patterns to copy to output path. */
    copyFiles?: (string | { from: string, to: string })[],

    /** Dev Server configuration. */
    devServer?: WebpackDevServer.Configuration,

    /** Entry points. */
    entry?: webpack.Configuration["entry"],

    /** Path to eslintrc file. */
    eslintrc?: string,

    /** The filename of the entry chunk as relative path inside the output path directory. */
    filename?: string,

    /** Force resolve to the ts file when next to the transpiled js file. */
    forceTs?: boolean | string[],

    /** Path to html template file or options object. */
    htmlTemplate?: string | HtmlWebpackPlugin.Options,

    /** The output directory. */
    output?: string,

    /** The output path from the view of the Javascript / HTML page.*/
    publicPath?: string,

    /** Path to tsconfig file.*/
    tsconfig?: string,

    /** Uses Workbox to offline cache handling.*/
    useWorkbox?: boolean,

    /** Webpack configuration used to extend defaults. */
    webpackConfig?: webpack.Configuration,
};

export default Configuration;