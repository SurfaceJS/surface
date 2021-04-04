import type { IExpression } from "@surface/expression";
import type IObservable     from "../interfaces/observable";
import type ITraceable      from "../interfaces/traceable";

type AttributeDirectiveDescriptor =
{
    expression: IExpression,
    key:        string,
    name:       string,
    type:       "oneway" | "twoway" | "interpolation",
} & IObservable & ITraceable;

export default AttributeDirectiveDescriptor;