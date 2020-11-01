import webpack from "webpack";

type BuildOptions =
{
    logLevel?: webpack.Stats.ToStringOptions,
    mode?:     webpack.Configuration["mode"],
    watch?:    boolean,
};

export default BuildOptions;