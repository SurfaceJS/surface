import ExpressionType from "../../expression-type";
import BaseExpression from "./abstracts/base-expression";

export default class ConstantExpression extends BaseExpression
{
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
        super();

        this._value = value;
    }

    public evaluate(): unknown
    {
        return this.value;
    }
}