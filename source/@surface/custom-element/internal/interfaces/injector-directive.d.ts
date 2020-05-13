import IExpression         from "@surface/expression/interfaces/expression";
import IObservable         from "./observable";
import ITemplateDescriptor from "./template-descriptor";
import ITraceable          from "./traceable";

export default interface IInjectorDirective extends IObservable, ITraceable
{
    descriptor: ITemplateDescriptor;
    expression: IExpression;
    key:        IExpression;
    path:       string;
}