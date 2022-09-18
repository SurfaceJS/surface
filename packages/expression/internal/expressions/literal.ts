import type IExpression      from "../interfaces/expression.js";
import NodeType              from "../node-type.js";
import type { LiteralValue } from "../types/operators.js";

export default class Literal implements IExpression
{
    public get type(): NodeType
    {
        return NodeType.Literal;
    }

    private _value: LiteralValue;
    public get value(): LiteralValue
    {
        return this._value;
    }

    /* c8 ignore next 4 */
    public set value(value: LiteralValue)
    {
        this._value = value;
    }

    public constructor(value: LiteralValue)
    {
        this._value = value;
    }

    public clone(): Literal
    {
        return new Literal(this.value);
    }

    public evaluate(): LiteralValue
    {
        return this.value;
    }

    public toString(): string
    {
        return typeof this.value == "string" ? `\"${this.value}\"` : `${this.value}`;
    }
}