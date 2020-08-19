import webpack from "webpack";

type BuildOptions =
{
    hot?:      boolean,
    logLevel?: webpack.Stats.ToStringOptions,
    mode?:     webpack.Configuration["mode"],
    watch?:    boolean,
    target?:   webpack.Configuration["target"],
};

export default BuildOptions;