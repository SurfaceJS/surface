import type Evaluator from "./evaluator.js";
import type ObservablePath from "./observable-path.js";

type DirectiveContext =
{
    element:     Element,
    key:         string,
    observables: ObservablePath[],
    scope:       object,
    value:       Evaluator,
};

export default DirectiveContext;