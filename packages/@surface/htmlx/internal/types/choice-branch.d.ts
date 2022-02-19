import type StackTrace     from "../../types/stack-trace";
import type Evaluator      from "./evaluator";
import type NodeFactory    from "./node-factory";
import type ObservablePath from "./observable-path";

type ChoiceBranch =
[
    evaluator:   Evaluator,
    observables: ObservablePath[],
    factory:     NodeFactory,
    source?:     string,
    stackTrace?: StackTrace,
];

export default ChoiceBranch;