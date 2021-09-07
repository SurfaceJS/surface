import type { StackTrace } from "../../types/index.js";
import type Evaluator      from "./evaluator";
import type NodeFactory    from "./node-fatctory";
import type ObservablePath from "./observable-path";

type BranchStatement =
[
    evaluator:   Evaluator,
    observables: ObservablePath[],
    factory:     NodeFactory,
    source?:     string,
    stackTrace?: StackTrace,
];

export default BranchStatement;