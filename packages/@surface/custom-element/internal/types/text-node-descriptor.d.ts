import type { IExpression } from "@surface/expression";
import type IObservable     from "../interfaces/observable";
import type ITraceable      from "../interfaces/traceable";

type TextNodeDescriptor =
{
    expression: IExpression,
    path:       string,
} & IObservable & ITraceable;

export default TextNodeDescriptor;