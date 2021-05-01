// eslint-disable-next-line import/extensions
import type { Options as EslintWebpackPluginOptions } from "eslint-webpack-plugin";
import type HtmlWebpackPlugin        from "html-webpack-plugin";
import type webpack                  from "webpack";
import type { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import type BuildConfiguration       from "./build-configuration";

type Formaters =
    | "checkstyle"
    | "codeframe"
    | "compact"
    | "html"
    | "jslint-xml"
    | "json-with-metadata"
    | "json"
    | "junit"
    | "stylish"
    | "table"
    | "tap"
    | "unix"
    | "visualstudio";

type EsLintOptions =
{

    /** Overrides all configurations used by the linter. You can use this option to define the settings that will be used even if your configuration files configure it. */
    config?: EslintWebpackPluginOptions["overrideConfig"],

    /** The configuration file to use used by the linter. Notes that paths resolution applied in config file is relative to cwd. */
    configFile?: string,

    /** Enables ESLint linter. */
    enabled?: boolean,

    /** Specify directories, files, or globs. */
    files?: string | string[],

    /** Formatter used by ESLint. */
    formatter?:  Formaters,
};

type Project =
{

    /** Bundle analyzer options */
    analyzer?: BundleAnalyzerPlugin.Options,

    /** The base directory for resolving the entry option. */
    context?: string,

    /** References to other projects to depend on. */
    dependencies?: string[],

    /** Configurations by mode. Use to override some defaults. */
    environments?:
    {
        development?: BuildConfiguration,
        production?:  BuildConfiguration,
    },

    /** Entry points. */
    entry?: Exclude<webpack.Configuration["entry"], Function>,

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