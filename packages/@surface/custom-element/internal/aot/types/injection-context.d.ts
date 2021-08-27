import type Factory            from "./fatctory.js";
import type Pattern            from "./pattern.js";
import type { DirectiveEntry } from ".";

type InjectionContext =
{
    host:             Node,
    parent:           Node,
    scope:            object,
    pattern:          Pattern,
    directives: Map<string, DirectiveEntry>,
    factory:          Factory,
};

export default InjectionContext;
