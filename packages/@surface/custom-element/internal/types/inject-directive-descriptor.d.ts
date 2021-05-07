import type { IExpression, IPattern } from "@surface/expression";
import type IDescribeable             from "../interfaces/describeable";
import type IKeyValueObservable       from "../interfaces/key-value-observable";
import type IKeyValueTraceable        from "../interfaces/key-value-traceable";

type InjectDirectiveDescriptor =
{
    keyExpression: IExpression,
    pattern:       IPattern,

} & IDescribeable & IKeyValueTraceable & IKeyValueObservable;

export default InjectDirectiveDescriptor;