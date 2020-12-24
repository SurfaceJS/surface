import type { IExpression } from "@surface/expression";
import type IObservable     from "./observable";
import type ITraceable      from "./traceable";

export default interface IAttributeDirective extends IObservable, ITraceable
{
    expression: IExpression;
    key:        string;
    name:       string;
    type:       "oneway" | "twoway" | "interpolation";
}