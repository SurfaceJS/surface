import type Logging from "./logging";

type CliOptions =
{
    context?:                  string,
    copyFiles?:                (string | { from: string, to: string })[],
    entry?:                    [string, ...string[]],
    eslintrc?:                 string,
    filename?:                 string,
    forceTs?:                  boolean | string[],
    htmlTemplate?:             string,
    logging?:                  Logging,
    output?:                   string,
    project?:                  string,
    publicPath?:               string,
    tsconfig?:                 string,
    useWorkbox?:               boolean,
    webpackConfiguration?:     string,
    webpackPostConfiguration?: string,
};

export default CliOptions;
