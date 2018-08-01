import { Unknown }    from "@surface/core";
import ExpressionType from "../../expression-type";
import IExpression    from "../../interfaces/expression";

export default class ConstantExpression implements IExpression
{
    private readonly _value: Unknown;
    public get value(): Unknown
    {
        return this._value;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.Constant;
    }

    public constructor(value: Unknown)
    {
        this._value = value;
    }

    public evaluate(): Unknown
    {
        return this.value;
    }
}