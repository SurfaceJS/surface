import type StrategyType    from "../enums/strategy-type.js";
import type SemanticVersion from "./semantic-version";

type CliPublishOptions =
{
    mode?:      "development" | "release",
    timestamp?: string,
    dry?:       boolean,
    strategy?:  StrategyType,
    target?:    SemanticVersion,
    token:      string,
};

export default CliPublishOptions;