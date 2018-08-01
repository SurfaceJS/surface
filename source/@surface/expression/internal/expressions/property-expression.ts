import { Unknown }    from "@surface/core";
import ExpressionType from "../../expression-type";
import IExpression    from "../../interfaces/expression";

export default class PropertyExpression implements IExpression
{
    private readonly _key: IExpression;
    public get key(): IExpression
    {
        return this._key;
    }

    private readonly _value: IExpression;
    public get value(): IExpression
    {
        return this._value;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.Property;
    }

    public constructor(key: IExpression, value: IExpression)
    {
        this._key   = key;
        this._value = value;
    }

    public evaluate(): Unknown
    {
        return this.value.evaluate();
    }
}