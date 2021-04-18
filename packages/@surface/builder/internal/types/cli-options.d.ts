import type Project from "./project.js";

type CliOptions =
{
    context?:                  string,
    entry?:                    [string, ...string[]],
    eslintrc?:                 string,
    filename?:                 string,
    htmlTemplate?:             string,
    includeFiles?:             (string | { from: string, to: string })[],
    logging?:                  Project["logging"],
    mode?:                     Project["mode"],
    output?:                   string,
    preferTs?:                 boolean | string[],
    project?:                  string,
    publicPath?:               string,
    tsconfig?:                 string,
    useWorkbox?:               boolean,
    webpackConfiguration?:     string,
    webpackPostConfiguration?: string,
};

export default CliOptions;
