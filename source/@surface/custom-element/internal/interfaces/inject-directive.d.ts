import IExpression         from "@surface/expression/interfaces/expression";
import IPattern            from "@surface/expression/interfaces/pattern";
import ITemplateDescriptor from "./template-descriptor";

export default interface IInjectDirective
{
    descriptor:   ITemplateDescriptor;
    destructured: boolean;
    key:          IExpression;
    path:         string;
    pattern:      string|IPattern;
}