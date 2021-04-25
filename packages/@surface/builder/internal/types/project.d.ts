// eslint-disable-next-line import/extensions
import type HtmlWebpackPlugin        from "html-webpack-plugin";
import type webpack                  from "webpack";
import type { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import type BuildConfiguration       from "./build-configuration";

type EsLintOptions =
{
    cwd?:      string,
    enabled?:  boolean,
    eslintrc?: string,
    files?:    string | string[],
};

type Project =
{

    /** Bundle analyzer options */
    analyzer?: BundleAnalyzerPlugin.Options,

    /** Configurations by mode. Use to override some defaults */
    configurations?:
    {
        development?: BuildConfiguration,
        production?:  BuildConfiguration,
    },

    /** The base directory for resolving the entry option. */
    context?: string,

    /** Entry points. */
    entry?: webpack.Configuration["entry"],

    /** Eslint options. */
    eslint?: EsLintOptions,

    /** The filename of the entry chunk as relative path inside the output path directory. */
    filename?: string,

    /** File patterns to copy to output path. */
    includeFiles?: (string | { from: string, to: string })[],

    /** Path to html index template file or options object. */
    index?: string | HtmlWebpackPlugin.Options,

    /** Enable production optimizations or development hints. */
    mode?: Exclude<webpack.Configuration["mode"], "none">,

    /** The output directory. */
    output?: string,

    /** Resolve to the ts file when next to the transpiled js file. Necessary only when both files are being included in the bundle. */
    preferTs?: boolean | string[],

    /** The output path from the view of the Javascript / HTML page.*/
    publicPath?: string,

    /** Environment to build for. */
    target?: "pwa" | "web" | "webworker",

    /** Path to tsconfig file. */
    tsconfig?: string,
};

export default Project;