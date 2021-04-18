
import type webpack          from "webpack";
import type WebpackExtension from "./webpack-extension";

type Configuration =
{

    /** Entry points. */
    entry: webpack.Configuration["entry"],

    /** The base directory for resolving the entry option. */
    context?: string,

    /** Path to eslintrc file. */
    eslintrc?: string,

    /** The filename of the entry chunk as relative path inside the output path directory. */
    filename?: string,

    /** Resolve to the ts file when next to the transpiled js file. */
    preferTs?: boolean | string[],

    /** Configuration name. */
    name?: string,

    /** The output directory. */
    output?: string,

    /** The output path from the view of the Javascript / HTML page.*/
    publicPath?: string,

    /** Path to tsconfig file.*/
    tsconfig?: string,

    /** Webpack configuration used to extend defaults. */
    webpack?: WebpackExtension,
};

export default Configuration;