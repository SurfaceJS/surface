/* eslint-disable @typescript-eslint/indent */
enum StrategyType
{
    Default = 0,
    ForceUpdate = 1,
    ForceVersion = 2,
    IgnoreDependents = 4,
    OnlyStable = 8
}

export default StrategyType;