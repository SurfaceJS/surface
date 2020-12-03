import { IExpression, IIdentifier, IPattern } from "@surface/expression";
import IDescribeable                          from "./describeable";
import IKeyValueObservable                    from "./key-value-observable";
import IKeyValueTraceable                     from "./key-value-traceable";

export default interface IInjectDirective extends IDescribeable, IKeyValueTraceable, IKeyValueObservable
{
    keyExpression: IExpression;
    pattern:       IIdentifier | IPattern;
}