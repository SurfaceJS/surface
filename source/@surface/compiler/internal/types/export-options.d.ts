import webpack      from "webpack";
import BuildOptions from "./build-options";

type ExportOptions =
{
    default?:       boolean,
    libraryExport?: NonNullable<webpack.Configuration["output"]>["libraryExport"],
} & BuildOptions;

export default ExportOptions;