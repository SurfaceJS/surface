import type { IArrowFunctionExpression, IMemberExpression } from "@surface/expression";
import type IObservable                                     from "../interfaces/observable";
import type ITraceable                                      from "../interfaces/traceable";

type EventDirectiveDescriptor =
{
    expression: IMemberExpression | IArrowFunctionExpression,
    name:       string,
} & IObservable & ITraceable;

export default EventDirectiveDescriptor;