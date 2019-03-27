import ExpressionType from "../../expression-type";
import IExpression    from "../../interfaces/expression";

export default class ConstantExpression implements IExpression
{
    public get cache(): unknown
    {
        return this.value;
    }

    private readonly _value: unknown;
    public get value(): unknown
    {
        return this._value;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.Constant;
    }

    public constructor(value: unknown)
    {
        this._value = value;
    }

    public evaluate(): unknown
    {
        return this.value;
    }
}