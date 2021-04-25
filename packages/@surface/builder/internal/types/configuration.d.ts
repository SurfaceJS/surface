
import type webpack          from "webpack";
import type WebpackDevServer from "webpack-dev-server";
import type Logging          from "./logging";
import type Project          from "./project";

type Configuration =
{

    /** Dev server configurations. */
    devServer?: WebpackDevServer.Configuration,

    /** Module specifier or hook object */
    hooks?: {

        /** Executed before compilation. */
        beforeRun?: ((configuration: webpack.Configuration) => Promise<webpack.Configuration>),
    },

    /** Main project. Used by dev server. */
    main?: string,

    /** Output verbosity level. */
    logging?:  Logging,

    /** Project map. */
    projects?: Record<string, Project>,
};

export default Configuration;