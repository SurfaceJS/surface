import type Configuration from "./configuration.js";

type CliOptions =
{
    mode?:                     Configuration["mode"],
    context?:                  string,
    copyFiles?:                (string | { from: string, to: string })[],
    entry?:                    [string, ...string[]],
    eslintrc?:                 string,
    filename?:                 string,
    forceTs?:                  boolean | string[],
    htmlTemplate?:             string,
    logging?:                  Configuration["logging"],
    output?:                   string,
    project?:                  string,
    publicPath?:               string,
    tsconfig?:                 string,
    useWorkbox?:               boolean,
    webpackConfiguration?:     string,
    webpackPostConfiguration?: string,
};

export default CliOptions;
