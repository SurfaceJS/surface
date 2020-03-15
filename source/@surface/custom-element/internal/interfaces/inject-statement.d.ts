import IExpression         from "@surface/expression/interfaces/expression";
import IPattern            from "@surface/expression/interfaces/pattern";
import ITemplateDescriptor from "./template-descriptor";

export default interface IInjectStatement
{
    descriptor: ITemplateDescriptor;
    pattern:    IPattern;
    key:        string|IExpression;
    path:       string;
}