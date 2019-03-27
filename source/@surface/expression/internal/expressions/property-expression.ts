import { Nullable }   from "@surface/core";
import { coalesce }   from "@surface/core/common/generic";
import ExpressionType from "../../expression-type";
import IExpression    from "../../interfaces/expression";

export default class PropertyExpression implements IExpression
{
    private _cache: Nullable<unknown>;
    public get cache(): unknown
    {
        return coalesce(this._cache, () => this.evaluate());
    }

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

    public evaluate(): unknown
    {
        return this._cache = this.value.evaluate();
    }
}