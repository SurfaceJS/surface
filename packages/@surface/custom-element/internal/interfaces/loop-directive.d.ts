import type { IExpression, IIdentifier, IPattern } from "@surface/expression";
import type IDescribeable                          from "./describeable";
import type IObservable                            from "./observable";
import type ITraceable                             from "./traceable";

export default interface ILoopDirective extends IDescribeable, IObservable, ITraceable
{
    left:     IIdentifier | IPattern;
    operator: "in" | "of";
    right:    IExpression;
}