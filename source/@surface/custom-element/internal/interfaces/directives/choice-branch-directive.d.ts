import { IExpression }     from "@surface/expression";
import IObservable         from "../observable";
import ITraceable          from "../traceable";
import IDescribeable       from "../describeable";

export default interface IChoiceBranchDirective extends IDescribeable, IObservable, ITraceable
{
    expression: IExpression;
}