import { IExpression }     from "@surface/expression";
import IDescribeable       from "../describeable";
import IObservable         from "../observable";
import ITraceable          from "../traceable";

export default interface IChoiceBranchDirective extends IDescribeable, IObservable, ITraceable
{
    expression: IExpression;
}