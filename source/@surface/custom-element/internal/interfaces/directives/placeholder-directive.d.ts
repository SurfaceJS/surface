import { IExpression }     from "@surface/expression";
import IDescribeable       from "../describeable";
import IKeyValueTraceable  from "../key-value-traceable";
import IKeyValueObservable from "../key-value-observable";

export default interface IPlaceholderDirective extends IDescribeable, IKeyValueObservable, IKeyValueTraceable
{
    expression:    IExpression;
    keyExpression: IExpression;
}