import ExpressionType from "../../expression-type";
import IExpression    from "../../interfaces/expression";
import BaseExpression from "./abstracts/base-expression";

export default class PropertyExpression extends BaseExpression
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
        super();

        this._key   = key;
        this._value = value;
    }

    public evaluate(): unknown
    {
        return this._cache = this.value.evaluate();
    }
}