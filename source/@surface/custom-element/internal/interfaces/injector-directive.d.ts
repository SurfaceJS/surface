import IExpression         from "@surface/expression/interfaces/expression";
import IObservable         from "./observable";
import ITemplateDescriptor from "./template-descriptor";

export default interface IInjectorDirective extends IObservable
{
    descriptor: ITemplateDescriptor;
    expression: IExpression;
    key:        IExpression;
    path:       string;
}