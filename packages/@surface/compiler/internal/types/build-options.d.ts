import type webpack     from "webpack";
import type Logging from "./logging";

type BuildOptions =
{
    logging?: Logging,
    mode?:    webpack.Configuration["mode"],
    watch?:   boolean,
};

export default BuildOptions;