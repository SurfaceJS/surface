import { IExpression } from "@surface/expression";
import IObservable     from "../observable";
import ITraceable      from "../traceable";

export default interface ITextNodeDescriptor extends IObservable, ITraceable
{
    expression: IExpression;
    path:       string;
}