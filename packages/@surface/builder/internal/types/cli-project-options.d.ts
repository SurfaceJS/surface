import type CliProjectOptions from "./cli-build-options";
import type Project           from "./project";

type ESLint = Required<Project>["eslint"];

type CliProjectOptions =
{
    context?:          string,
    entry?:            string[],
    eslintConfigFile?: string,
    eslintEnabled?:    boolean,
    eslintFiles?:      string,
    eslintFormatter?:  ESLint["formatter"],
    filename?:         string,
    includeFiles?:     string[],
    index?:            string,
    mode?:             Project["mode"],
    output?:           string,
    preferTs?:         boolean | string[],
    publicPath?:       string,
    target?:           Project["target"],
    tsconfig?:         string,
};

export default CliProjectOptions;
