import type { IExpression, IIdentifier, IPattern } from "@surface/expression";
import type IDescribeable                          from "./describeable";
import type IKeyValueObservable                    from "./key-value-observable";
import type IKeyValueTraceable                     from "./key-value-traceable";

export default interface IInjectDirective extends IDescribeable, IKeyValueTraceable, IKeyValueObservable
{
    keyExpression: IExpression;
    pattern:       IIdentifier | IPattern;
}