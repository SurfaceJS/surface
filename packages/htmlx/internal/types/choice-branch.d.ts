import type StackTrace     from "../../types/stack-trace.js";
import type Evaluator      from "./evaluator.js";
import type NodeFactory    from "./node-factory.js";
import type ObservablePath from "./observable-path.js";

type ChoiceBranch =
[
    evaluator:   Evaluator,
    observables: ObservablePath[],
    factory:     NodeFactory,
    source?:     string,
    stackTrace?: StackTrace,
];

export default ChoiceBranch;