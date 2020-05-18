import { IExpression, IPattern } from "@surface/expression";
import IObservable               from "./observable";
import ITemplateDescriptor       from "./template-descriptor";
import Identifier                from "@surface/expression/internal/expressions/identifier";
import ITraceable                from "./traceable";

export default interface ILoopDirective extends IObservable, ITraceable
{
    descriptor: ITemplateDescriptor;
    left:       Identifier|IPattern;
    operator:   "in"|"of";
    path:       string;
    right:      IExpression;
}