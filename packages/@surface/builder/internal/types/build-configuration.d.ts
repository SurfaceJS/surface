import type webpack          from "webpack";
import type { FileOverride } from "../plugins/override-resolver-plugin.js";

type BuildConfiguration =
{

    /** Overrides files during compilation. */
    overrides?: FileOverride[],
} & Pick<webpack.Configuration, "cache" | "performance" | "optimization">;

export default BuildConfiguration;