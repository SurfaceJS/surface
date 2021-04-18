import type HtmlWebpackPlugin        from "html-webpack-plugin";
import type webpack                  from "webpack";
import type { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import type WebpackDevServer         from "webpack-dev-server";
import type Configuration            from "./configuration";
import type Logging                  from "./logging";

type Project =
{

    /** Bundler analyzer options. */
    bundlerAnalyzer?: BundleAnalyzerPlugin.Options,

    /** Configurations used by multicompiler. When specified, all root configuration will merge with it. */
    dependencies?: Configuration[],

    /** Dev Server configuration. */
    devServer?: WebpackDevServer.Configuration,

    /** File patterns to copy to output path. */
    includeFiles?: (string | { from: string, to: string })[],

    /** Path to html template file or options object. */
    htmlTemplate?: string | HtmlWebpackPlugin.Options,

    /** Output verbosity level. */
    logging?: Logging,

    /** Enable production optimizations or development hints. */
    mode?: webpack.Configuration["mode"],

    /** Uses Workbox to offline cache handling.*/
    useWorkbox?: boolean,

} & Partial<Configuration>;

export default Project;