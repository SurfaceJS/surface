import type { IExpression } from "@surface/expression";
import type IDescribeable   from "./describeable";
import type IObservable     from "./observable";
import type ITraceable      from "./traceable";

export default interface IChoiceBranchDirective extends IDescribeable, IObservable, ITraceable
{
    expression: IExpression;
}