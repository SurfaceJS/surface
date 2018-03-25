import ExpressionType from "../../expression-type";
import IExpression    from "../../interfaces/expression";

import { Nullable } from "@surface/types";

export default class ConstantExpression implements IExpression
{
    private readonly _value: Nullable<Object>;
    public get value(): Nullable<Object>
    {
        return this._value;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.Constant;
    }

    public constructor(value: Nullable<Object>)
    {
        this._value = value;
    }

    public evaluate(): Nullable<Object>
    {
        return this.value;
    }
}