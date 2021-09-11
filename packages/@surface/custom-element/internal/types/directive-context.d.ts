import type StackTrace     from "../../types/stack-trace";
import type Evaluator      from "./evaluator.js";
import type ObservablePath from "./observable-path.js";

type DirectiveContext =
{
    element:     HTMLElement,
    key:         string,
    observables: ObservablePath[],
    scope:       object,
    value:       Evaluator,
    source?:     string,
    stackTrace?: StackTrace,
};

export default DirectiveContext;