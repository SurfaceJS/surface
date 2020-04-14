import IExpression from "@surface/expression/interfaces/expression";
import IObservable from "./observable";

export default interface ITextNodeDescriptor extends IObservable
{
    expression: IExpression;
    path:       string;
}
