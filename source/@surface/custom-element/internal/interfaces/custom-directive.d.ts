import { IExpression }     from "@surface/expression";
import IKeyValueObservable from "./key-value-observable";
import IKeyValueTraceable  from "./key-value-traceable";

export default interface ICustomDirective extends IKeyValueObservable, IKeyValueTraceable
{
    expression:    IExpression;
    keyExpression: IExpression;
    name:          string;
}