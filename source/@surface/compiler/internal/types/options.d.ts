import webpack from "webpack";

type Options =
{
    context?:       string,
    entry?:         string,
    eslintrc?:      string,
    filename?:      string,
    forceTs?:       boolean | string[],
    htmlTemplate?:  string,
    logLevel?:      webpack.Stats.ToStringOptions,
    mode?:          webpack.Configuration["mode"],
    output?:        string,
    project?:       string,
    publicPath?:    string,
    tsconfig?:      string,
    watch?:         boolean,
    webpackConfig?: string,
};

export default Options;
