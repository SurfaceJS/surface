import { IExpression, IPattern } from "@surface/expression";
import Identifier                from "@surface/expression/internal/expressions/identifier";
import IDescribeable             from "../describeable";
import IObservable               from "../observable";
import ITraceable                from "../traceable";

export default interface ILoopDirective extends IDescribeable, IObservable, ITraceable
{
    left:     Identifier | IPattern;
    operator: "in" | "of";
    right:    IExpression;
}