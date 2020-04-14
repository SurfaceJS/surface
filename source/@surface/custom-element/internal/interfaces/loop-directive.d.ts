import IExpression         from "@surface/expression/interfaces/expression";
import IPattern            from "@surface/expression/interfaces/pattern";
import IObservable         from "./observable";
import ITemplateDescriptor from "./template-descriptor";

export default interface ILoopDirective extends IObservable
{
    alias:        string|IPattern;
    descriptor:   ITemplateDescriptor;
    destructured: boolean;
    expression:   IExpression;
    operator:     "in"|"of";
    path:         string;
}