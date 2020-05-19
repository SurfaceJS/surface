import { IExpression, IPattern } from "@surface/expression";
import IObservable   from "./observable";
import Identifier    from "@surface/expression/internal/expressions/identifier";
import ITraceable    from "./traceable";
import IDescribeable from "./describeable";

export default interface ILoopDirective extends IDescribeable, IObservable, ITraceable
{
    left:     Identifier|IPattern;
    operator: "in"|"of";
    right:    IExpression;
}