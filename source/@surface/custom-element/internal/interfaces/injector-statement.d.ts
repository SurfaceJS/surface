import IExpression         from "@surface/expression/interfaces/expression";
import ITemplateDescriptor from "./template-descriptor";

export default interface IInjectorStatement
{
    descriptor: ITemplateDescriptor;
    expression: IExpression;
    key:        string|IExpression;
    path:       string;
}