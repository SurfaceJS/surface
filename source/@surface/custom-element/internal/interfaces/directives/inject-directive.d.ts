import { IIdentifier, IExpression, IPattern } from "@surface/expression";
import IDescribeable                          from "../describeable";
import IKeyValueTraceable                     from "../key-value-traceable";
import IObservable                            from "../observable";

export default interface IInjectDirective extends IDescribeable, IKeyValueTraceable, IObservable
{
    keyExpression: IExpression;
    pattern:       IIdentifier|IPattern;
}