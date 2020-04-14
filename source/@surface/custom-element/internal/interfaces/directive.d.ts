import IExpression         from "@surface/expression/interfaces/expression";
import IKeyValueObservable from "./key-value-observable";

export default interface IDirective extends IKeyValueObservable
{
    value: IExpression;
    key:        IExpression;
    name:       string;
}