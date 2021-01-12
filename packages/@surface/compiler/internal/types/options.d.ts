import type webpack from "webpack";

type Options =
{
    context?:       string,
    copyFiles?:     (string | { from: string, to: string })[],
    entry?:         [string, ...string[]],
    eslintrc?:      string,
    filename?:      string,
    forceTs?:       boolean | string[],
    htmlTemplate?:  string,
    logLevel?:      webpack.Stats.ToStringOptions,
    output?:        string,
    project?:       string,
    publicPath?:    string,
    tsconfig?:      string,
    useWorkbox?:    boolean,
    webpackConfig?: string,
};

export default Options;
