import type webpack from "webpack";

type DevServerOptions =
{
    host?:     string,
    hot?:      boolean,
    logLevel?: webpack.Stats.ToStringOptions,
    port?:     number,
};

export default DevServerOptions;