import type Evaluator                      from "./evaluator.js";
import type NodeFactory                    from "./node-factory.js";
import type { ObservablePath, StackTrace } from "@surface/htmlx-parser";

type ChoiceBranch =
[
    evaluator:   Evaluator,
    observables: ObservablePath[],
    factory:     NodeFactory,
    source?:     string,
    stackTrace?: StackTrace,
];

export default ChoiceBranch;
