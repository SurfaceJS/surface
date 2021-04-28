import type StrategyType    from "../enums/strategy-type.js";
import type SemanticVersion from "./semantic-version";

type CliPublishOptions =
{
    config?:   "development" | "release",
    debug?:    boolean,
    strategy?: StrategyType,
    target?:  SemanticVersion,
    token:     string,
};

export default CliPublishOptions;