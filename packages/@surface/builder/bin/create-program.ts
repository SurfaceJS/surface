import commander                                         from "commander";
import { parsePattern, toArray, toBooleanOrStringArray } from "../internal/common.js";
import { loggingPattern, modePattern, targetPattern }    from "../internal/patterns.js";

export default function createProgram(): commander.Command
{
    return new commander.Command()
        .storeOptionsAsProperties(false)
        .option("--clean                          [n]", "Enables clean builds. Note that clean builds can lead to unexpected results for projects with same output.")
        .option("--config                         <n>", "Path to configuration file.")
        .option("--context                        <n>", "The base directory for resolving the entry option.")
        .option("--entry                          <n>", "Entry points.", toArray)
        .option("--eslintrc                       <n>", "Path to eslintrc file.")
        .option("--filename                       <n>", "The filename of the entry chunk as relative path inside the output path directory.")
        .option("--include-files                  <n>", "File patterns to copy to output path.", toArray)
        .option("--index                          <n>", "Path to html index file.")
        .option("--logging                        [n]", "Output verbosity level. Can be 'none', 'verbose', 'error', 'warn', 'info' or 'log'.", parsePattern(loggingPattern))
        .option("--main                           <n>", "Specify main project. Used by dev server.")
        .option("--mode                           <n>", "Enable production optimizations or development hints.", parsePattern(modePattern))
        .option("--output                         <n>", "The output directory.")
        .option("--prefer-ts                      [n]", "Resolve to the ts file when next to the transpiled js file. Necessary only when both files are being included in the bundle.", toBooleanOrStringArray)
        .option("--project                        <n>", "When a configuration file is specified. Defines which project will have the settings overwritten. Otherwise, it will be used as the project name.")
        .option("--public-path                    <n>", "The output path from the view of the Javascript / HTML page.")
        .option("--target                         <n>", "Environment to build for. Can be 'pwa', 'web' or 'webworker'.", parsePattern(targetPattern))
        .option("--tsconfig                       <n>", "Path to tsconfig file.");
}