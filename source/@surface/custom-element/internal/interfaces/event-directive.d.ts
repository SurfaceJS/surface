import { IExpression } from "@surface/expression";
import IObservable     from "./observable";
import ITraceable      from "./traceable";

export default interface IEventDirective extends IObservable, ITraceable
{
    expression: IExpression;
    name:       string;
}