import ExpressionType from "../../expression-type";
import IExpression    from "../../interfaces/expression";
import BaseExpression from "./abstracts/base-expression";

export default class PropertyExpression extends BaseExpression
{
    private readonly _computed: boolean;
    public get computed(): boolean
    {
        return this._computed;
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

    public constructor(key: IExpression, value: IExpression, computed: boolean)
    {
        super();

        this._key      = key;
        this._value    = value;
        this._computed = computed;
    }

    public evaluate(): unknown
    {
        return this._cache = this.value.evaluate();
    }

    public toString(): string
    {
        return `${this.computed ? `[${this.key}]` : `"${this.key.evaluate()}"` }: ${this.value}`;
    }
}