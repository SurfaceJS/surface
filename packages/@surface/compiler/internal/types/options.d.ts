type Options =
{
    context?:       string,
    copyFiles?:     (string | { from: string, to: string })[],
    entry?:         [string, ...string[]],
    eslintrc?:      string,
    filename?:      string,
    forceTs?:       boolean | string[],
    htmlTemplate?:  string,
    logLevel?:      "detailed" | "errors-only" | "errors-warnings" | "minimal" | "none" | "normal" | "summary" | "verbose",
    output?:        string,
    project?:       string,
    publicPath?:    string,
    tsconfig?:      string,
    webpackConfig?: string,
};

export default Options;
