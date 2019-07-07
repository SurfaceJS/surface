import IExpression from "../../interfaces/expression";
import INode       from "../../interfaces/node";
import NodeType    from "../../node-type";
import TypeGuard   from "../type-guard";

export default class Property implements INode
{
    private _computed: boolean;
    public get computed(): boolean
    {
        return this._computed;
    }

    public set computed(value: boolean)
    {
        this._computed = value;
    }

    private _key: IExpression;
    public get key(): IExpression
    {
        return this._key;
    }

    public set key(value: IExpression)
    {
        this._key = value;
    }

    private _shorthand: boolean;
    public get shorthand(): boolean
    {
        return this._shorthand;
    }

    public set shorthand(value: boolean)
    {
        this._shorthand = value;
    }

    private _value: IExpression;
    public get value(): IExpression
    {
        return this._value;
    }

    public set value(value: IExpression)
    {
        this._value = value;
    }

    public get type(): NodeType
    {
        return NodeType.Property;
    }

    public constructor(key: IExpression, value: IExpression, computed: boolean, shorthand: boolean)
    {
        this._key        = key;
        this._value      = value;
        this._computed   = computed;
        this._shorthand  = shorthand;
    }

    public toString(): string
    {
        if (this.shorthand)
        {
            return this.value.toString();
        }
        else
        {
            if (TypeGuard.isIdentifier(this.key) || (TypeGuard.isLiteral(this.key) && typeof this.key.value == "number"))
            {
                return `${this.computed ? `[${this.key}]` : this.key}: ${this.value}`;
            }

            return `${this.computed ? `[${this.key}]` : this.key}: ${this.value}`;
        }
    }
}