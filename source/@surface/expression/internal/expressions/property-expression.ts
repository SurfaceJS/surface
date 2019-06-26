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

    private readonly _shorthand: boolean;
    public get shorthand(): boolean
    {
        return this._shorthand;
    }

    private _value: IExpression;
    public get value(): IExpression
    {
        return this._value;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.Property;
    }

    public constructor(key: IExpression, value: IExpression, computed: boolean, shorthand: boolean)
    {
        super();

        this._key        = key;
        this._value      = value;
        this._computed   = computed;
        this._shorthand  = shorthand;
    }

    public update(value: IExpression): void
    {
        this._value = value;
    }

    public evaluate(): unknown
    {
        return this._cache = this.value.evaluate();
    }

    public toString(): string
    {
        return this.shorthand ? this.value.toString() : `${this.computed ? `[${this.key}]` : `"${this.key.evaluate()}"` }: ${this.value}`;
    }
}