import StackTrace from "../../types/stack-trace";
import type DestructuredEvaluator from "./destructured-evaluator.js";
import type NodeFactory           from "./node-fatctory.js";
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
