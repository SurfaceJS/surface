import type StackTrace            from "../../types/stack-trace.js";
import type DestructuredEvaluator from "./destructured-evaluator.js";
import type NodeFactory           from "./node-factory.js";
import type { DirectiveEntry }    from ".";

type InjectionContext =
{
    directives:  Map<string, DirectiveEntry>,
    factory:     NodeFactory,
    host:        Node,
    parent:      Node,
    scope:       object,
    value:       DestructuredEvaluator,
    source?:     string,
    stackTrace?: StackTrace,
};

export default InjectionContext;
