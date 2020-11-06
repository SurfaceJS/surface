import { IExpression, IIdentifier, IPattern } from "@surface/expression";
import IDescribeable                          from "./describeable";
import IObservable                            from "./observable";
import ITraceable                             from "./traceable";

export default interface ILoopDirective extends IDescribeable, IObservable, ITraceable
{
    left:     IIdentifier | IPattern;
    operator: "in" | "of";
    right:    IExpression;
}