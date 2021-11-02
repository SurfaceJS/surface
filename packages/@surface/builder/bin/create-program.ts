/* eslint-disable max-len */
import commander                                                               from "commander";
import { toArray, toBoolean, toBooleanOrEnum, toBooleanOrStringArray, toEnum } from "../internal/common.js";

export default function createProgram(): commander.Command
{
    return new commander.Command()
        .storeOptionsAsProperties(false)
        .option("--clean                          [n]", "Enables clean builds. Note that clean builds can lead to unexpected results for projects with same output.", toBoolean)
        .option("--config                         <n>", "Path to configuration file.")
        .option("--context                        <n>", "The base directory for resolving the entry option.")
        .option("--entry                          <n>", "Entry points.", toArray)
        .option("--eslint-config-file             <n>", "The configuration file to use. Notes that paths resolution applied in config file is relative to cwd.")
        .option("--eslint-enabled                 [n]", "Enables ESLint linter.", toBoolean)
        .option("--eslint-files                   <n>", "Specify directories, files, or globs.")
        .option("--eslint-formatter               <n>", "Formatter used by ESLint.", toEnum("checkstyle", "codeframe", "compact", "html", "jslint-xml", "json-with-metadata", "json", "junit", "stylish", "table", "tap", "unix", "visualstudio"))
        .option("--filename                       <n>", "The filename of the entry chunk as relative path inside the output path directory.")
        .option("--include-files                  <n>", "File patterns to copy to output path.", toArray)
        .option("--index                          <n>", "Path to html index file.")
        .option("--logging                        [n]", "Output verbosity level. Can be an boolean or 'none', 'summary', 'errors-only', 'errors-warnings', 'minimal', 'normal', 'detailed', 'verbose'.", toBooleanOrEnum("none", "summary", "errors-only", "errors-warnings", "minimal", "normal", "detailed", "verbose"))
        .option("--main                           <n>", "Specify main project. Used by dev server.")
        .option("--output                         <n>", "The output directory.")
        .option("--mode                           <n>", "Enable production optimizations or development hints.", toEnum("development", "production"))
        .option("--prefer-ts                      [n]", "Resolve to the ts file when next to the transpiled js file. Necessary only when both files are being included in the bundle.", toBooleanOrStringArray)
        .option("--project                        <n>", "When a configuration file is specified. Defines which project will have the settings overwritten. Otherwise, it will be used as the project name.")
        .option("--public-path                    <n>", "The output path from the view of the Javascript / HTML page.")
        .option("--target                         <n>", "Environment to build for. Can be 'pwa', 'web' or 'webworker'.", toEnum("pwa", "web", "webworker"))
        .option("--htmlx                          <n>", "Compilation mode of htmlx templates used by @surface/htmlx. Can be 'aot', 'mixed' or 'runtime'.", toEnum("aot", "mixed", "runtime"))
        .option("--tsconfig                       <n>", "Path to tsconfig file.");
}