import type { IExpression } from "@surface/expression";
import type IDescribeable   from "../interfaces/describeable";
import type IObservable     from "../interfaces/observable";
import type ITraceable      from "../interfaces/traceable";

type ChoiceBranchDirectiveDescriptor =
{
    expression: IExpression,
} & IDescribeable & IObservable & ITraceable;

export default ChoiceBranchDirectiveDescriptor;