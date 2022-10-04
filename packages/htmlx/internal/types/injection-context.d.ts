import type { StackTrace }        from "@surface/htmlx-parser";
import type DestructuredEvaluator from "./destructured-evaluator.js";
import DirectiveEntry             from "./directive-entry.js";
import type NodeFactory           from "./node-factory.js";

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
