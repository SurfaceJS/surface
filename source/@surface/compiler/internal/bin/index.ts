import { Command }                from "commander";
import { toBooleanOrStringArray } from "../common";

export default function createProgram(): Command
{
    return new Command()
        .storeOptionsAsProperties(false)
        .option("-c, --context       <n>", "The base directory for resolving the entry option (absolute path).")
        .option("-e, --entry         <n>", "Entry points.", (x = "") => x.split(","))
        .option("-f, --filename      <n>", "The filename of the entry chunk as relative path inside the output.path directory.")
        .option("-o, --output        <n>", "The output directory (absolute path).")
        .option("-p, --project       <n>", "Path to project file (absolute path).")
        .option("-t, --html-template <n>", "Path to html template file (absolute path).")
        .option("--eslintrc          <n>", "Path to eslintrc file (absolute path).")
        .option("--force-ts          [n]", "Force resolve to the ts file when next to the transpiled js file.", toBooleanOrStringArray)
        .option("--public-path       <n>", "Include comments with information about the modules.")
        .option("--tsconfig          <n>", "Path to tsconfig file (absolute path).")
        .option("--webpack-config    <n>", "Path to webpack-config file (absolute path)") as Command;
}