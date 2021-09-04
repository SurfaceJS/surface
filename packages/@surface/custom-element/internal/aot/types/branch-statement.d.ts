import type Evaluator     from "./evaluator";
import type NodeFactory        from "./node-fatctory";
import type ObservablePath from "./observable-path";

type BranchStatement =
[
    expression:  Evaluator,
    observables: ObservablePath[],
    factory:     NodeFactory,
];

export default BranchStatement;