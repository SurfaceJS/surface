import IExpression    from "../../interfaces/expression";
import ExpressionType from "../../expression-type";

import { Nullable } from "@surface/types";

export default class MemberExpression implements IExpression
{
    private readonly _property: IExpression;
    public get property(): IExpression
    {
        return this._property;
    }

    private readonly _target: IExpression;
    public get target(): IExpression
    {
        return this._target;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.Member;
    }

    public constructor(target: IExpression, property: IExpression)
    {
        this._property = property;
        this._target   = target;
    }

    public evaluate(): Nullable<Object>
    {
        return (this.target.evaluate() as Object)[this.property.evaluate() as string];
    }
}