import { IExpression }    from "@surface/expression";
import IObservable        from "../observable";
import IDescribeable      from "../describeable";
import IKeyValueTraceable from "../key-value-traceable";

export default interface IPlaceholderDirective extends IDescribeable, IObservable, IKeyValueTraceable
{
    expression:    IExpression;
    keyExpression: IExpression;
}