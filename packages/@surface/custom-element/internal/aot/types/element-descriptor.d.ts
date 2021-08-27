import type Expression     from "./expression";
import type Factory        from "./fatctory";
import type ObservablePath from "./observable-path";

declare type ElementDescriptor =
{
    tag:               string,
    attributes?:       [key: string, value: string][],
    interpolation?:    [key: string, value: Expression, observables: ObservablePath[]][],
    oneWay?:           [key: string, value: Expression, observables: ObservablePath[]][],
    twoWay?:           [key: string, value: Expression, observables: ObservablePath][],
    events?:           [key: string, value: Expression][],
    directives?:       [key: Expression, value: Expression, observables: [key: ObservablePath[], value: ObservablePath[]]][],
    childs?:           Factory[],
};

export default ElementDescriptor;
