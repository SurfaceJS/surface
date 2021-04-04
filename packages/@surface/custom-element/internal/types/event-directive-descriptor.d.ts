import type { IExpression } from "@surface/expression";
import type IObservable     from "../interfaces/observable";
import type ITraceable      from "../interfaces/traceable";

type EventDirectiveDescriptor =
{
    expression: IExpression,
    name:       string,
} & IObservable & ITraceable;

export default EventDirectiveDescriptor;