import { IIdentifier, IExpression, IPattern } from "@surface/expression";
import IDescribeable                          from "../describeable";
import IKeyValueTraceable                     from "../key-value-traceable";
import IKeyValueObservable                    from "../key-value-observable";

export default interface IInjectDirective extends IDescribeable, IKeyValueTraceable, IKeyValueObservable
{
    keyExpression: IExpression;
    pattern:       IIdentifier|IPattern;
}