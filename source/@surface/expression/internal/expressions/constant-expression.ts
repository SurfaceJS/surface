import NodeType from "../../node-type";
import BaseExpression from "./abstracts/base-expression";

export default class ConstantExpression extends BaseExpression
{
    private _value: unknown;
    public get value(): unknown
    {
        return this._value;
    }

    public set value(value: unknown)
    {
        this._value = value;
    }

    public get type(): NodeType
    {
        return NodeType.Constant;
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

    public toString(): string
    {
        return typeof this.value == "string" ? `\"${this.value}\"` : `${this.value}`;
    }
}