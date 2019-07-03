import NodeType from "../../node-type";
import BaseExpression from "./abstracts/base-expression";

export default class ConstantExpression extends BaseExpression
{
    private readonly _value: unknown;
    public get value(): unknown
    {
        return this._value;
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
        return typeof this.value == "string" ?
            `\"${this.value}\"`
            : typeof this.value == "symbol" ?
                this.value.toString()
                : `${this.value}`;
    }
}