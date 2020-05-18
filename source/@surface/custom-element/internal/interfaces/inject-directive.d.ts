import { IIdentifier, IExpression, IPattern } from "@surface/expression";
import ITemplateDescriptor                    from "./template-descriptor";
import ITraceable                             from "./traceable";

export default interface IInjectDirective extends ITraceable
{
    descriptor: ITemplateDescriptor;
    key:        IExpression;
    path:       string;
    pattern:    IIdentifier|IPattern;
}