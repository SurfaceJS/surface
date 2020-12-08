import type { IExpression }     from "@surface/expression";
import type IKeyValueObservable from "./key-value-observable";
import type IKeyValueTraceable  from "./key-value-traceable";

export default interface ICustomDirective extends IKeyValueObservable, IKeyValueTraceable
{
    expression:    IExpression;
    keyExpression: IExpression;
    name:          string;
}