import IExpression         from "@surface/expression/interfaces/expression";
import IPattern            from "@surface/expression/interfaces/pattern";
import ITemplateDescriptor from "./template-descriptor";

export default interface ILoopDirective
{
    alias:        string|IPattern;
    descriptor:   ITemplateDescriptor;
    destructured: boolean;
    expression:   IExpression;
    operator:     "in"|"of";
    path:         string;
}