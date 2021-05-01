import type webpack          from "webpack";
import type { FileOverride } from "../plugins/override-resolver-plugin.js";

type BuildConfiguration =
{

    /** Overrides files during compilation. */
    overrides?: FileOverride[],

    /** Accepts an array with the environment variables that will be used or an object with the variables and their default values. */
    variables?: string[] | Record<string, string>,
} & Pick<webpack.Configuration, "cache" | "performance" | "optimization">;

export default BuildConfiguration;