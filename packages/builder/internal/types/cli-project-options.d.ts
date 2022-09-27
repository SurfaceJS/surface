import type Project from "./project.js";

type ESLint = Required<Project>["eslint"];

type CliProjectOptions =
{
    context?:                string,
    entry?:                  string[],
    eslintConfigFile?:       string,
    eslintEnabled?:          boolean,
    eslintFiles?:            string,
    eslintFormatter?:        ESLint["formatter"],
    filename?:               string,
    includeFiles?:           string[],
    index?:                  string,
    mode?:                   Project["mode"],
    output?:                 string,
    preferTs?:               boolean | string[],
    publicPath?:             string,
    target?:                 Project["target"],
    htmlx?:                  Project["htmlx"],
    tsconfig?:               string,
};

export default CliProjectOptions;
