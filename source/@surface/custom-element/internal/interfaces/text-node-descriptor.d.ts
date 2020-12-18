import type { IExpression } from "@surface/expression";
import type IObservable     from "./observable";
import type ITraceable      from "./traceable";

export default interface ITextNodeDescriptor extends IObservable, ITraceable
{
    expression: IExpression;
    path:       string;
}