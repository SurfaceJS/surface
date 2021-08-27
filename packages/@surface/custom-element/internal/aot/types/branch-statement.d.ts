import type Expression     from "./expression";
import type Factory        from "./fatctory";
import type ObservablePath from "./observable-path";

type BranchStatement =
{
    expression:  Expression,
    observables: ObservablePath[],
    factory:     Factory,
};

export default BranchStatement;