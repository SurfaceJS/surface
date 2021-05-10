
import type webpack          from "webpack";
import type WebpackDevServer from "webpack-dev-server";
import type Project          from "./project";

type Configuration =
{

    /** Enables clean builds. Note that clean builds can lead to unexpected results for projects with same output. */
    clean?: boolean,

    /** Dev server configurations. */
    devServer?: WebpackDevServer.Configuration,

    /** Module specifier or hook object */
    hooks?: {

        /** Executed after the configuration is created and before it is applied. */
        configured?: ((configuration: webpack.Configuration) => Promise<webpack.Configuration>),
    },

    /** Main project. Used by dev server. */
    main?: string,

    /** Output verbosity level. */
    logging?: webpack.Configuration["stats"],

    /** Project map. */
    projects?: Record<string, Project>,
};

export default Configuration;