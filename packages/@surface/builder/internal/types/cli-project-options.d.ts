import type CliProjectOptions from "./cli-build-options";
import type Project           from "./project";

type CliProjectOptions =
{
    context?:      string,
    entry?:        string[],
    eslintrc?:     string,
    filename?:     string,
    includeFiles?: string[],
    index?:        string,
    mode?:         Project["mode"],
    output?:       string,
    preferTs?:     boolean | string[],
    publicPath?:   string,
    target?:       Project["target"],
    tsconfig?:     string,
};

export default CliProjectOptions;
