import { IExpression }     from "@surface/expression";
import IKeyValueObservable from "./key-value-observable";
import ITraceable          from "./traceable";

export default interface IDirective extends IKeyValueObservable, ITraceable
{
    key:   IExpression;
    name:  string;
    value: IExpression;
}