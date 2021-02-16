import type webpack     from "webpack";
import type Logging from "./logging";

type CliBuildOptions =
{
    logging?: Logging,
    mode?:    webpack.Configuration["mode"],
    watch?:   boolean,
};

export default CliBuildOptions;