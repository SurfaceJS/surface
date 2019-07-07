import ILiteral         from "../../interfaces/literal";
import NodeType         from "../../node-type";
import { LiteralValue } from "../../types";

export default class Literal implements ILiteral
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