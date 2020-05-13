import IExpression         from "@surface/expression/interfaces/expression";
import IPattern            from "@surface/expression/interfaces/pattern";
import ITemplateDescriptor from "./template-descriptor";
import Identifier          from "@surface/expression/internal/expressions/identifier";
import ITraceable          from "./traceable";

export default interface IInjectDirective extends ITraceable
{
    descriptor: ITemplateDescriptor;
    key:        IExpression;
    path:       string;
    pattern:    Identifier|IPattern;
}