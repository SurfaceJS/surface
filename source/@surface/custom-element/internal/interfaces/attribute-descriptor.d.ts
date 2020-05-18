import IExpression from "@surface/expression/interfaces/expression";
import IObservable from "./observable";
import ITraceable  from "./traceable";

export default interface IAttributeDescriptor extends IObservable, ITraceable
{
    expression: IExpression;
    key:        string;
    name:       string;
    type:       "oneway"|"twoway"|"interpolation";
}
