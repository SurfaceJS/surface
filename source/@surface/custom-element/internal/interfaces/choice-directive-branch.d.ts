import IExpression         from "@surface/expression/interfaces/expression";
import IObservable         from "./observable";
import ITemplateDescriptor from "./template-descriptor";

export default interface IChoiceDirectiveBranch extends IObservable
{
    descriptor: ITemplateDescriptor;
    expression: IExpression;
    path:       string;
}
