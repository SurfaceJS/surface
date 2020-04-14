import IExpression from "@surface/expression/interfaces/expression";
import IObservable from "./observable";

export default interface IAttributeDescriptor extends IObservable
{
    expression: IExpression;
    key:        string;
    name:       string;
    type:       "oneway"|"twoway"|"interpolation";
}
