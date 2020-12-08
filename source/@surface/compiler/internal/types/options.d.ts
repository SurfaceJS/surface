import type webpack from "webpack";

type Options =
{
    context?:       string,
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
    webpackConfig?: string,
};

export default Options;
