import type { IExpression }     from "@surface/expression";
import type IKeyValueObservable from "../interfaces/key-value-observable";
import type IKeyValueTraceable  from "../interfaces/key-value-traceable";

type DirectiveDescriptor =
{
    expression:    IExpression,
    keyExpression: IExpression,
    name:          string,
} & IKeyValueObservable & IKeyValueTraceable;

export default DirectiveDescriptor;