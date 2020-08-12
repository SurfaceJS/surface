import { IExpression }     from "@surface/expression";
import IDescribeable       from "../describeable";
import IKeyValueObservable from "../key-value-observable";
import IKeyValueTraceable  from "../key-value-traceable";

export default interface IPlaceholderDirective extends IDescribeable, IKeyValueObservable, IKeyValueTraceable
{
    expression:    IExpression;
    keyExpression: IExpression;
}