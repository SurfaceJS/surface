import type { IExpression, IIdentifier, IPattern } from "@surface/expression";
import type IDescribeable                          from "../interfaces/describeable";
import type IKeyValueObservable                    from "../interfaces/key-value-observable";
import type IKeyValueTraceable                     from "../interfaces/key-value-traceable";

type InjectDirectiveDescriptor =
{
    keyExpression: IExpression,
    pattern:       IIdentifier | IPattern,
} & IDescribeable & IKeyValueTraceable & IKeyValueObservable;

export default InjectDirectiveDescriptor;