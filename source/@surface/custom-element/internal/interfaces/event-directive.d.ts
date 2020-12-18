import type { IExpression } from "@surface/expression";
import type IObservable     from "./observable";
import type ITraceable      from "./traceable";

export default interface IEventDirective extends IObservable, ITraceable
{
    expression: IExpression;
    name:       string;
}