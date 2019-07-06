import ILiteral         from "../../interfaces/literal";
import NodeType         from "../../node-type";
import { LiteralValue } from "../../types";
import BaseExpression   from "./abstracts/base-expression";

export default class Literal extends BaseExpression implements ILiteral
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

    public set value(value: LiteralValue)
    {
        this._value = value;
    }

    public constructor(value: LiteralValue)
    {
        super();

        this._value = value;
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