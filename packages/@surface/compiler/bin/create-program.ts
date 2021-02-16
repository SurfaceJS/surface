import commander                                                               from "commander";
import { toArray, toBoolean, toBooleanOrParsePattern, toBooleanOrStringArray } from "../internal/common.js";
import { loggingPattern }                                                      from "../internal/patterns.js";

export default function createProgram(): commander.Command
{
    return new commander.Command()
        .storeOptionsAsProperties(false)
        .option("-c, --context          <n>", "The base directory for resolving the entry option.")
        .option("-e, --entry            <n>", "Entry points.", toArray)
        .option("-f, --filename         <n>", "The filename of the entry chunk as relative path inside the output path directory.")
        .option("-o, --output           <n>", "The output directory.")
        .option("-p, --project          <n>", "Path to project file.")
        .option("-t, --html-template    <n>", "Path to html template file.")
        .option("--copy-files           <n>", "File patterns to copy to output path.", toArray)
        .option("--eslintrc             <n>", "Path to eslintrc file.")
        .option("--force-ts             [n]", "Force resolve to the ts file when next to the transpiled js file.", toBooleanOrStringArray)
        .option("--logging              [n]", "Output verbosity level. Can be 'none', 'verbose', 'error', 'warn', 'info' or 'log'.", toBooleanOrParsePattern(loggingPattern))
        .option("--public-path          <n>", "The output path from the view of the Javascript / HTML page.")
        .option("--tsconfig             <n>", "Path to tsconfig file.")
        .option("--use-workbox          [n]", "Use workbox to handle service workers.", toBoolean)
        .option("--webpack-config       <n>", "Path to webpack-config file.") as commander.Command;
}