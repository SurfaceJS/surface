import type { IExpression }     from "@surface/expression";
import type IDescribeable       from "../interfaces/describeable";
import type IKeyValueObservable from "../interfaces/key-value-observable";
import type IKeyValueTraceable  from "../interfaces/key-value-traceable";

type PlaceholderDirectiveDescriptor =
{
    expression:    IExpression,
    keyExpression: IExpression,
} &  IDescribeable & IKeyValueObservable & IKeyValueTraceable;

export default PlaceholderDirectiveDescriptor;