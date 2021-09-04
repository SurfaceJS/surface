import type DestructuredEvaluator from "./destructured-evaluator.js";
import type NodeFactory           from "./node-fatctory.js";
import type { DirectiveEntry }    from ".";

type InjectionContext =
{
    directives: Map<string, DirectiveEntry>,
    factory:    NodeFactory,
    host:       Node,
    parent:     Node,
    scope:      object,
    value:      DestructuredEvaluator,
};

export default InjectionContext;
