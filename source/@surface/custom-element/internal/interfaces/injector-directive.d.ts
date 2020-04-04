import IExpression         from "@surface/expression/interfaces/expression";
import ITemplateDescriptor from "./template-descriptor";

export default interface IInjectorDirective
{
    descriptor: ITemplateDescriptor;
    expression: IExpression;
    key:        IExpression;
    path:       string;
}