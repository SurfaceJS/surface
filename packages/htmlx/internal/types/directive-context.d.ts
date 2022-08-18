import type { ObservablePath, StackTrace } from "@surface/htmlx-parser";
import type Evaluator                      from "./evaluator.js";

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