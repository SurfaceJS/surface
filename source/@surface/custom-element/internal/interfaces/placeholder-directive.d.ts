import type { IExpression }     from "@surface/expression";
import type IDescribeable       from "./describeable";
import type IKeyValueObservable from "./key-value-observable";
import type IKeyValueTraceable  from "./key-value-traceable";

export default interface IPlaceholderDirective extends IDescribeable, IKeyValueObservable, IKeyValueTraceable
{
    expression:    IExpression;
    keyExpression: IExpression;
}