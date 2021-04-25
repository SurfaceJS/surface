import type webpack from "webpack";

type BuildConfiguration = Pick<webpack.Configuration, "cache" | "performance" | "optimization">;

export default BuildConfiguration;